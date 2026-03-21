
import { useMemo, memo } from 'react';
import uPlot from 'uplot';

import { useChartTimeBuckets } from '@shared/hooks/useChartTimeBuckets';
import { tsKey, tsMs } from '@shared/utils/chartDataUtils';
import { CHART_COLORS } from '@config/constants';

import UPlotChart, { defaultAxes, uLine } from '../UPlotChart';

function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/**
 * ExceptionTypeLineChart renders exception counts grouped by exception type
 * as a multi-series line chart. Layout and style mirrors ServiceErrorRate:
 *  - Same global time-bucket X-axis (via useChartTimeBuckets)
 *  - No in-canvas legend (uses external TopEndpointsList instead)
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
  const { timeBuckets } = useChartTimeBuckets();

  const stepMs = timeBuckets.length >= 2
    ? new Date(timeBuckets[1]).getTime() - new Date(timeBuckets[0]).getTime()
    : 60_000;

  const chartData = useMemo(() => {
    const groupMap = serviceTimeseriesMap as Record<string, any[]>;
    const groups = Object.keys(groupMap);

    if (groups.length === 0) {
      return [];
    }

    const activeGroups = selectedEndpoints.length > 0
      ? groups.filter((g) => selectedEndpoints.includes(g))
      : groups;

    return activeGroups.map((exceptionType, idx) => {
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

      return {
        label: exceptionType,
        values,
        color: getChartColor(idx),
      };
    });
  }, [serviceTimeseriesMap, selectedEndpoints, timeBuckets, stepMs]);

  const timestamps = useMemo(
    () => timeBuckets.map((t) => tsMs(t) / 1000),
    [timeBuckets],
  );

  const uplotData = useMemo<uPlot.AlignedData>(() => {
    return [
      timestamps,
      ...chartData.map((s) => s.values),
    ] as uPlot.AlignedData;
  }, [timestamps, chartData]);

  const maxVal = useMemo(() => {
    let max = 0;
    for (const s of chartData) {
      for (const v of s.values) {
        if (v > max) max = v;
      }
    }
    return max;
  }, [chartData]);

  const yMax = Math.max(Math.ceil(maxVal * 1.2), 1);

  const opts = useMemo<Omit<uPlot.Options, 'width' | 'height'>>(() => ({
    axes: [
      ...defaultAxes().slice(0, 1),
      {
        ...defaultAxes()[1],
        values: (_u: uPlot, vals: number[]) =>
          vals.map((v) => (Number.isInteger(v) ? String(v) : v.toFixed(1))),
        range: [0, yMax],
      },
    ],
    scales: {
      y: { min: 0, max: yMax },
    },
    series: [
      {},
      ...chartData.map((s) =>
        uLine(s.label, s.color),
      ),
    ],
  }), [chartData, yMax]);

  const hasData = chartData.length > 0;

  if (!hasData && timeBuckets.length === 0) {
    return (
      <div style={{ height: '100%', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>No exception data in selected time range</div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '100%', minHeight: '200px' }}>
      <UPlotChart options={opts} data={uplotData} />
    </div>
  );
});
