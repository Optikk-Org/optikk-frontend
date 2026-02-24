import { useMemo } from 'react';
import { Empty } from 'antd';
import { Line } from 'react-chartjs-2';
import { createChartOptions, createLineDataset, getChartColor } from '@utils/chartHelpers';
import { useChartTimeBuckets } from '@hooks/useChartTimeBuckets';

// Normalize timestamps to "YYYY-MM-DD HH:mm" for reliable cross-source matching.
function tsKey(ts) {
  if (!ts) return '';
  return String(ts).replace('T', ' ').replace('Z', '').substring(0, 16);
}

export default function ErrorRateChart({
  data = [],
  endpoints = [],
  selectedEndpoints = [],
  serviceTimeseriesMap = {},
  targetThreshold = null,
  datasetLabel = 'Error Rate %',
  color = '#F04438'
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

        const total = Number(row.request_count || 0);
        const errors = Number(row.error_count || 0);

        if (!tsMap[bucketKey]) {
          tsMap[bucketKey] = { total: 0, errors: 0 };
        }
        tsMap[bucketKey].total += total;
        tsMap[bucketKey].errors += errors;
      }

      const values = timeBuckets.map(d => {
        const bucket = tsMap[tsKey(d)];
        if (!bucket || bucket.total === 0) return 0;
        return (bucket.errors / bucket.total) * 100;
      });
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
      const stepMs = timeBuckets.length >= 2 ? new Date(timeBuckets[1]).getTime() - new Date(timeBuckets[0]).getTime() : 60000;
      datasets = Object.entries(serviceTimeseriesMap).slice(0, 10).map(([svcName, rows], idx) => {
        const tsMap = {};
        for (const row of rows) {
          if (!row.timestamp) continue;
          const rowTime = new Date(row.timestamp).getTime();
          const alignedTimeMs = Math.floor(rowTime / stepMs) * stepMs;
          const bucketKey = tsKey(new Date(alignedTimeMs).toISOString());

          const total = Number(row.request_count || 0);
          const errors = Number(row.error_count || 0);

          if (!tsMap[bucketKey]) {
            tsMap[bucketKey] = { total: 0, errors: 0 };
          }
          tsMap[bucketKey].total += total;
          tsMap[bucketKey].errors += errors;
        }

        const values = timeBuckets.map(d => {
          const bucket = tsMap[tsKey(d)];
          if (!bucket || bucket.total === 0) return 0;
          return (bucket.errors / bucket.total) * 100;
        });
        return createLineDataset(svcName, values, getChartColor(idx), false);
      });
    } else {
      // Map data values onto full-range buckets
      const dataMap = {};
      for (const d of data) dataMap[tsKey(d.timestamp)] = d.value;
      datasets = [createLineDataset(datasetLabel, timeBuckets.map(ts => dataMap[tsKey(ts)] ?? 0), color, true)];
    }

    // Add target threshold line if provided
    if (targetThreshold !== null) {
      const formattedLimit = Number.isInteger(Number(targetThreshold)) ? targetThreshold : Number(targetThreshold).toFixed(2).replace(/\.?0+$/, '');
      datasets.push({
        label: `Limit (${formattedLimit}%)`,
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

  // Compute max from all data sources for relative Y-axis scaling
  const allDataValues = useMemo(() => {
    const vals = data.map(d => d.value || 0);
    if (Object.keys(serviceTimeseriesMap).length > 0) {
      Object.values(serviceTimeseriesMap).forEach(rows => {
        rows.forEach(r => {
          const total = Number(r.request_count || 0);
          const errors = Number(r.error_count || 0);
          if (total > 0) vals.push((errors / total) * 100);
        });
      });
    }
    endpoints.forEach(ep => {
      const rate = ep.error_rate !== undefined ? Number(ep.error_rate)
        : (ep.request_count > 0 ? (ep.error_count / ep.request_count) * 100 : 0);
      if (rate > 0) vals.push(rate);
    });
    return vals;
  }, [data, serviceTimeseriesMap, endpoints]);
  const maxDataVal = Math.max(...allDataValues, targetThreshold || 0, 0);
  const yAxisMax = Math.max(Math.ceil(maxDataVal * 2.0), 1);

  const options = createChartOptions({
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            if (ctx.parsed.y == null) return null;
            return `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}%`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#666',
          callback: (v) => {
            const num = Number(v);
            return Number.isInteger(num) ? `${num}%` : `${num.toFixed(1)}%`;
          }
        },
        grid: { color: '#2D2D2D' },
        beginAtZero: true,
        max: Math.max(yAxisMax, targetThreshold ? targetThreshold * 1.5 : 0),
      },
    },
  });

  if (data.length === 0 && timeBuckets.length === 0) {
    return (
      <div style={{ height: '100%', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty description="No error data in selected time range" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '100%', minHeight: '200px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
