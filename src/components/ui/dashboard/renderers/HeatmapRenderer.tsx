import { Empty, Table } from 'antd';
import { useMemo } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

import type {
  DashboardComponentSpec,
  DashboardDataSources,
  DashboardExtraContext,
} from '@/types/dashboardConfig';

import LatencyHistogram from '@components/charts/distributions/LatencyHistogram';
import LogHistogram from '@components/charts/distributions/LogHistogram';
import GaugeChart from '@components/charts/micro/GaugeChart';
import LatencyHeatmapChart from '@components/charts/specialized/LatencyHeatmapChart';
import ServiceGraph from '@components/charts/specialized/ServiceGraph';
import WaterfallChart from '@components/charts/specialized/WaterfallChart';

import {
  createBarDataset,
  createChartOptions,
  createLineDataset,
  getChartColor,
} from '@utils/chartHelpers';

import { APP_COLORS } from '@config/colorLiterals';

import { useDashboardData } from '../hooks/useDashboardData';
import { buildAiTimeseries, resolveDataSourceId } from '../utils/dashboardUtils';

/**
 *
 */
export function HeatmapRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
}) {
  const { rawData, data: rows } = useDashboardData(chartConfig, dataSources);

  if (rows.length === 0) {
    return <Empty description="No data" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 20 }} />;
  }

  const xKey = chartConfig.xKey || 'operationName';
  const yKey = chartConfig.yKey || 'serviceName';
  const valueKey = chartConfig.valueKey || 'errorRate';

  const xValues = Array.from(new Set(rows.map((r: any) => String(r[xKey] ?? '')))).slice(0, 20);
  const yValues = Array.from(new Set(rows.map((r: any) => String(r[yKey] ?? ''))));
  const lookup: Record<string, Record<string, number>> = {};
  for (const row of rows) {
    const x = String(row[xKey] ?? '');
    const y = String(row[yKey] ?? '');
    if (!lookup[y]) lookup[y] = {};
    lookup[y][x] = Number(row[valueKey]) || 0;
  }
  const maxVal = Math.max(...rows.map((r: any) => Number(r[valueKey]) || 0), 1);

  const height = Number(chartConfig.height || 360);
  return (
    <div style={{ maxHeight: height, overflowY: 'auto' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
        <thead>
          <tr>
            <th style={{ padding: '4px 8px', textAlign: 'left' }}></th>
            {xValues.map((x) => (
              <th key={x} style={{ padding: '4px 6px', fontWeight: 400, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={x}>{x.slice(0, 12)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {yValues.map((y) => (
            <tr key={y}>
              <td style={{ padding: '4px 8px', fontWeight: 500, whiteSpace: 'nowrap' }}>{y}</td>
              {xValues.map((x) => {
                const val = lookup[y]?.[x] ?? 0;
                const intensity = Math.min(1, val / maxVal);
                const bg = `rgba(240,68,56,${intensity.toFixed(2)})`;
                return (
                  <td key={x} style={{ background: bg, padding: '4px 6px', textAlign: 'center', color: intensity > 0.5 ? '#fff' : 'inherit' }}>
                    {val > 0 ? (val < 1 ? val.toFixed(2) : val.toFixed(0)) : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
