import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { AlertCircle } from 'lucide-react';

import { APP_COLORS } from '@config/colorLiterals';

import type { LogAggregateRow } from '../../types';

const SERVICE_COLORS = [
  APP_COLORS.hex_f04438,
  APP_COLORS.hex_f79009,
  APP_COLORS.hex_5e60ce,
  APP_COLORS.hex_06aed5,
  APP_COLORS.hex_d92d20,
  APP_COLORS.hex_98a2b3,
];

interface LogsErrorRateChartProps {
  rows: LogAggregateRow[];
  isLoading: boolean;
}

export default function LogsErrorRateChart({ rows, isLoading }: LogsErrorRateChartProps) {
  // Pivot: [{time_bucket, service1: rate, service2: rate, ...}]
  const { chartData, services } = useMemo(() => {
    const bucketMap = new Map<string, Record<string, number>>();
    const serviceSet = new Set<string>();

    for (const row of rows) {
      const bucket = row.time_bucket;
      if (!bucketMap.has(bucket)) bucketMap.set(bucket, {});
      bucketMap.get(bucket)![row.group_value] = row.error_rate ?? 0;
      serviceSet.add(row.group_value);
    }

    const sortedBuckets = Array.from(bucketMap.keys()).sort();
    const chartData = sortedBuckets.map(bucket => ({ bucket, ...bucketMap.get(bucket) }));
    const services = Array.from(serviceSet);

    return { chartData, services };
  }, [rows]);

  if (isLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}><div className="ok-spinner" /></div>;
  }

  if (!rows.length) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: 'var(--text-secondary)', fontSize: 12 }}>No error rate data</div>;
  }

  const buckets = chartData.map(d => d.bucket);

  const option = {
    grid: { top: 4, right: 8, bottom: 24, left: 36 },
    xAxis: {
      type: 'category' as const,
      data: buckets,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 10, interval: 'auto' as const },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value' as const,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 10, formatter: '{value}%' },
      splitLine: { lineStyle: { type: 'dashed' as const } },
    },
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: 'var(--glass-bg)',
      borderColor: 'var(--glass-border)',
      borderWidth: 1,
      borderRadius: 8,
      textStyle: { fontSize: 11 },
      valueFormatter: (value: number | undefined) => `${(value ?? 0).toFixed(1)}%`,
    },
    legend: {
      bottom: 0,
      textStyle: { fontSize: 11 },
    },
    series: services.map((svc, i) => {
      const color = SERVICE_COLORS[i % SERVICE_COLORS.length];
      return {
        name: svc,
        type: 'line' as const,
        data: chartData.map(d => (d as Record<string, number | string>)[svc] ?? 0),
        lineStyle: { color, width: 1.5 },
        itemStyle: { color },
        symbol: 'none',
        areaStyle: { color: color + '22', opacity: 1 },
        animation: false,
      };
    }),
  };

  return (
    <div className="logs-chart-card logs-chart-card--wide">
      <div className="logs-chart-card-header">
        <span className="logs-chart-card-title"><AlertCircle size={15} />Error Rate by Service (%)</span>
      </div>
      <div className="logs-chart-card-body" style={{ height: 140 }}>
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge />
      </div>
    </div>
  );
}
