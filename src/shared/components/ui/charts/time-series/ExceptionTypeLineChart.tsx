
import { useMemo, memo } from 'react';
import { Line } from 'react-chartjs-2';

import { useChartTimeBuckets } from '@shared/hooks/useChartTimeBuckets';
import { createChartOptions, createLineDataset, getChartColor } from '@shared/utils/chartHelpers';
import { APP_COLORS } from '@config/colorLiterals';

// Normalize timestamp to "YYYY-MM-DD HH:mm" for reliable cross-source matching.
function tsKey(ts: any) {
  if (!ts) return '';
  return String(ts).replace('T', ' ').replace('Z', '').substring(0, 16);
}

// Parse a timestamp value robustly across API formats.
function tsMs(ts: any) {
  if (!ts) return NaN;
  const raw = String(ts).trim();
  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(normalized);
  const ms = new Date(hasTimezone ? normalized : `${normalized}Z`).getTime();
  return Number.isNaN(ms) ? NaN : ms;
}

/**
 * ExceptionTypeLineChart renders exception counts grouped by exception type
 * as a multi-series line chart. Layout and style mirrors ServiceErrorRate:
 *  - Same global time-bucket X-axis (via useChartTimeBuckets)
 *  - No in-canvas Chart.js legend (uses external TopEndpointsList instead)
 *  - Y-axis shows raw integer counts
 *
 * @param root0
 * @param root0.serviceTimeseriesMap  Precomputed map of { exceptionType → rows[] }
 * @param root0.endpoints             List objects used for "name" labels (passed by ConfigurableChartCard)
 * @param root0.selectedEndpoints     Keys currently highlighted (for future click-to-filter support)
 */
export default memo(function ExceptionTypeLineChart({
  serviceTimeseriesMap = {},
  endpoints = [],
  selectedEndpoints = [],
}: any) {
  const { timeBuckets, labels } = useChartTimeBuckets();

  const stepMs = timeBuckets.length >= 2
    ? new Date(timeBuckets[1]).getTime() - new Date(timeBuckets[0]).getTime()
    : 60_000;

  const chartData = useMemo(() => {
    const groupMap = serviceTimeseriesMap as Record<string, any[]>;
    const groups = Object.keys(groupMap);

    if (groups.length === 0) {
      return { labels, datasets: [] };
    }

    const activeGroups = selectedEndpoints.length > 0
      ? groups.filter((g) => selectedEndpoints.includes(g))
      : groups;

    const datasets = activeGroups.map((exceptionType, idx) => {
      const rows = groupMap[exceptionType] || [];

      // Build a lookup: aligned-bucket-key → summed count
      const tsMap: Record<string, number> = {};
      for (const row of rows) {
        const rowTs = row.timestamp ?? row.time_bucket ?? row.timeBucket ?? '';
        if (!rowTs) continue;
        const rowMs = tsMs(rowTs);
        if (Number.isNaN(rowMs)) continue;

        const alignedMs = Math.floor(rowMs / stepMs) * stepMs;
        const key = tsKey(new Date(alignedMs).toISOString());
        const count = Number(row.count ?? row.value ?? 0);
        tsMap[key] = (tsMap[key] ?? 0) + count;
      }

      const values = timeBuckets.map((d) => tsMap[tsKey(d)] ?? 0);

      return createLineDataset(
        exceptionType,
        values,
        getChartColor(idx),
        false,
      );
    });

    return { labels, datasets };
  }, [serviceTimeseriesMap, selectedEndpoints, timeBuckets, labels, stepMs]);

  const maxVal = useMemo(() => {
    let max = 0;
    for (const ds of chartData.datasets) {
      for (const v of ds.data as number[]) {
        if (v > max) max = v;
      }
    }
    return max;
  }, [chartData.datasets]);

  const options = useMemo(() => createChartOptions({
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            if (ctx.parsed.y == null) return null;
            return `${ctx.dataset.label}: ${ctx.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        grid: { color: APP_COLORS.hex_2d2d2d },
        beginAtZero: true,
        min: 0,
        max: Math.max(Math.ceil(maxVal * 1.2), 1),
        ticks: {
          color: APP_COLORS.hex_666,
          count: 6,
          callback: (v: any) => {
            const num = Number(v);
            return Number.isInteger(num) ? String(num) : num.toFixed(1);
          },
        },
      },
    },
  }), [maxVal]);

  const hasData = chartData.datasets.length > 0;

  if (!hasData && timeBuckets.length === 0) {
    return (
      <div style={{ height: '100%', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>No exception data in selected time range</div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '100%', minHeight: '200px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
});
