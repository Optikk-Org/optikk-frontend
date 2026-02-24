import { useMemo } from 'react';
import { Empty } from 'antd';
import { Line } from 'react-chartjs-2';
import { createChartOptions, createLineDataset, getChartColor } from '@utils/chartHelpers';
import { useChartTimeBuckets } from '@hooks/useChartTimeBuckets';

// Normalize any timestamp string to a canonical key for lookups.
// Handles both "2024-01-01 10:05:00" and ISO "2024-01-01T10:05:00Z" formats.
function tsKey(ts) {
  if (!ts) return '';
  return String(ts).replace('T', ' ').replace('Z', '').substring(0, 16); // "YYYY-MM-DD HH:mm"
}

// Parse timestamp values robustly across API formats.
// If timezone is missing (e.g. "2026-02-24 10:25:00"), treat as UTC.
function tsMs(ts) {
  if (!ts) return NaN;
  const raw = String(ts).trim();
  const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
  const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(normalized);
  const ms = new Date(hasTimezone ? normalized : `${normalized}Z`).getTime();
  return Number.isNaN(ms) ? NaN : ms;
}

export default function RequestChart({
  data = [],
  endpoints = [],
  selectedEndpoints = [],
  serviceTimeseriesMap = {},
  datasetLabel = 'Requests/min',
  color = '#5E60CE',
  valueKey = 'request_count'
}) {
  const hasServiceData = Object.keys(serviceTimeseriesMap).length > 0;
  const { timeBuckets, labels } = useChartTimeBuckets();

  // Build per-item datasets using real timeseries data
  const buildServiceDatasets = (endpointList) => {
    const targetMap = {};
    for (const ep of endpointList) {
      const key = ep.key || ep.service_name || ep.service || '';
      const label = ep.endpoint || ep.service_name || ep.service || key;
      if (!targetMap[key]) targetMap[key] = { label };
    }

    // Determine stepMs from the generated buckets to floor backend timestamps
    const stepMs = timeBuckets.length >= 2
      ? new Date(timeBuckets[1]).getTime() - new Date(timeBuckets[0]).getTime()
      : 60000;

    return Object.entries(targetMap).map(([key, info], idx) => {
      const tsData = serviceTimeseriesMap[key] || [];
      const tsMap = {};

      for (const row of tsData) {
        if (!row.timestamp) continue;
        const rowTime = tsMs(row.timestamp);
        if (Number.isNaN(rowTime)) continue;
        // Floor to nearest bucket using stepMs
        const alignedTimeMs = Math.floor(rowTime / stepMs) * stepMs;
        const bucketKey = tsKey(new Date(alignedTimeMs).toISOString());

        // Sum values if multiple rows fall into the same bucket (e.g. 1m data in 5m buckets)
        tsMap[bucketKey] = (tsMap[bucketKey] || 0) + Number(row[valueKey] || 0);
      }

      const values = timeBuckets.map(d => tsMap[tsKey(d)] ?? 0);
      return createLineDataset(info.label, values, getChartColor(idx), false);
    });
  };

  const chartData = useMemo(() => {
    let datasets;
    if (endpoints.length > 0) {
      const list = selectedEndpoints.length > 0
        ? endpoints.filter(ep => {
          const key = ep.key || (() => {
            const method = (ep.http_method || '').toUpperCase();
            const op = ep.operation_name || ep.endpoint_name || 'Unknown';
            const cleanOp = op.startsWith(method + ' ') ? op.substring(method.length + 1) : op;
            return `${method} ${cleanOp}_${ep.service_name || ''}`;
          })();
          return selectedEndpoints.includes(key);
        })
        : endpoints;

      if (hasServiceData) {
        datasets = buildServiceDatasets(list);
      } else {
        // Fallback to plotting zeros if no data available yet
        datasets = list.map((ep, idx) => {
          return createLineDataset(
            `${ep.http_method || 'N/A'} ${ep.operation_name || ep.endpoint_name || 'Unknown'}`,
            timeBuckets.map(() => 0),
            getChartColor(idx),
            false
          );
        });
      }
    } else if (hasServiceData) {
      // No endpoint filter — show one line per service
      const stepMs = timeBuckets.length >= 2 ? new Date(timeBuckets[1]).getTime() - new Date(timeBuckets[0]).getTime() : 60000;
      datasets = Object.entries(serviceTimeseriesMap).slice(0, 10).map(([svcName, rows], idx) => {
        const tsMap = {};
        for (const row of rows) {
          if (!row.timestamp) continue;
          const rowTime = tsMs(row.timestamp);
          if (Number.isNaN(rowTime)) continue;
          const alignedTimeMs = Math.floor(rowTime / stepMs) * stepMs;
          const bucketKey = tsKey(new Date(alignedTimeMs).toISOString());
          tsMap[bucketKey] = (tsMap[bucketKey] || 0) + Number(row[valueKey] || 0);
        }
        const values = timeBuckets.map(d => tsMap[tsKey(d)] ?? 0);
        return createLineDataset(svcName, values, getChartColor(idx), false);
      });
    } else {
      // Map data values onto full-range buckets
      const dataMap = {};
      for (const d of data) dataMap[tsKey(d.timestamp)] = d[valueKey] !== undefined ? d[valueKey] : d.value;
      datasets = [createLineDataset(datasetLabel, timeBuckets.map(ts => dataMap[tsKey(ts)] ?? 0), color, true)];
    }

    return { labels, datasets };
  }, [data, endpoints, selectedEndpoints, serviceTimeseriesMap, hasServiceData, timeBuckets, labels]);

  // Compute maximum value for relative Y-axis scaling
  const yAxisMax = useMemo(() => {
    let maxVal = 0;
    chartData.datasets.forEach(ds => {
      const dsMax = Math.max(...ds.data.map(v => Number(v) || 0), 0);
      if (dsMax > maxVal) maxVal = dsMax;
    });
    return Math.max(Math.ceil(maxVal * 1.5), 1);
  }, [chartData]);

  const options = createChartOptions({
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = ctx.parsed.y;
            if (v == null) return null;
            return `${ctx.dataset.label}: ${v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toFixed(0)}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#666',
          font: { size: 11 },
          callback: (value) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
            return value.toFixed(0);
          },
        },
        grid: { color: '#2D2D2D' },
        beginAtZero: true,
        max: yAxisMax,
      },
    },
  });

  if (data.length === 0 && timeBuckets.length === 0) {
    return (
      <div style={{ height: '100%', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="No request data in selected time range" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '100%', minHeight: '200px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
