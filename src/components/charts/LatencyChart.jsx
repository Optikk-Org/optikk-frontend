import { useMemo } from 'react';
import { Empty } from 'antd';
import { Line } from 'react-chartjs-2';
import { createChartOptions, createLineDataset, getChartColor } from '@utils/chartHelpers';
import { useChartTimeBuckets } from '@hooks/useChartTimeBuckets';

function tsKey(ts) {
  if (!ts) return '';
  return String(ts).replace('T', ' ').replace('Z', '').substring(0, 16);
}

export default function LatencyChart({
  data = [],
  endpoints = [],
  selectedEndpoints = [],
  serviceTimeseriesMap = {},
  targetThreshold = null,
  datasetLabel = 'Avg Latency (ms)',
  color = '#5E60CE'
}) {
  const hasServiceData = Object.keys(serviceTimeseriesMap).length > 0;
  const { timeBuckets, labels } = useChartTimeBuckets();

  const buildServiceDatasets = (endpointList) => {
    const targetMap = {};
    for (const ep of endpointList) {
      const key = ep.key || ep.service_name || ep.service || '';
      const label = ep.endpoint || ep.service_name || ep.service || key;
      if (!targetMap[key]) targetMap[key] = { label };
    }
    const stepMs = timeBuckets.length >= 2 ? new Date(timeBuckets[1]).getTime() - new Date(timeBuckets[0]).getTime() : 60000;

    return Object.entries(targetMap).map(([key, info], idx) => {
      const tsData = serviceTimeseriesMap[key] || [];
      const tsMap = {};
      for (const row of tsData) {
        if (!row.timestamp) continue;
        const rowTime = new Date(row.timestamp).getTime();
        const alignedTimeMs = Math.floor(rowTime / stepMs) * stepMs;
        const bucketKey = tsKey(new Date(alignedTimeMs).toISOString());

        tsMap[bucketKey] = Math.max(tsMap[bucketKey] || 0, Number(row.avg_latency || 0));
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
      const stepMs = timeBuckets.length >= 2 ? new Date(timeBuckets[1]).getTime() - new Date(timeBuckets[0]).getTime() : 60000;
      datasets = Object.entries(serviceTimeseriesMap).slice(0, 10).map(([svcName, rows], idx) => {
        const tsMap = {};
        for (const row of rows) {
          if (!row.timestamp) continue;
          const rowTime = new Date(row.timestamp).getTime();
          const alignedTimeMs = Math.floor(rowTime / stepMs) * stepMs;
          const bucketKey = tsKey(new Date(alignedTimeMs).toISOString());
          tsMap[bucketKey] = Math.max(tsMap[bucketKey] || 0, Number(row.avg_latency || 0));
        }
        const values = timeBuckets.map(d => tsMap[tsKey(d)] ?? 0);
        return createLineDataset(svcName, values, getChartColor(idx), false);
      });
    } else {
      if (data.length > 0 && data[0].value !== undefined) {
        // Show single line if `value` is present rather than percentiles
        const dataMap = {};
        for (const d of data) dataMap[tsKey(d.timestamp)] = d.value;
        datasets = [createLineDataset(datasetLabel, timeBuckets.map(ts => dataMap[tsKey(ts)] ?? 0), color, true)];
      } else {
        // Show P50/P95/P99 lines mapped onto full-range buckets
        const p50Map = {}, p95Map = {}, p99Map = {};
        for (const d of data) {
          const key = tsKey(d.timestamp);
          p50Map[key] = d.p50 ?? 0;
          p95Map[key] = d.p95 ?? 0;
          p99Map[key] = d.p99 ?? 0;
        }
        datasets = [
          createLineDataset('P50', timeBuckets.map(ts => p50Map[tsKey(ts)] ?? 0), '#73C991', false),
          createLineDataset('P95', timeBuckets.map(ts => p95Map[tsKey(ts)] ?? 0), '#F79009', false),
          createLineDataset('P99', timeBuckets.map(ts => p99Map[tsKey(ts)] ?? 0), '#F04438', false),
        ];
      }
    }

    if (targetThreshold !== null) {
      datasets.push({
        label: `Target (${targetThreshold}ms)`,
        data: timeBuckets.map(() => targetThreshold),
        borderColor: '#F79009',
        borderDash: [6, 3],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        tension: 0,
      });
    }

    return { labels, datasets };
  }, [data, endpoints, selectedEndpoints, serviceTimeseriesMap, hasServiceData, targetThreshold, timeBuckets, labels]);

  const options = createChartOptions({
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            if (ctx.parsed.y == null) return null;
            return `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(0)}ms`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: { color: '#666', callback: (v) => `${v}ms` },
        grid: { color: '#2D2D2D' },
        beginAtZero: true,
      },
    },
  });

  if (data.length === 0 && timeBuckets.length === 0) {
    return (
      <div style={{ height: '100%', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="No latency data in selected time range" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '100%', minHeight: '200px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
