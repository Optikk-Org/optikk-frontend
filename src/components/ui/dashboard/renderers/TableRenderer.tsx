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
export function TableRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
}) {
  const { rawData, data: rows } = useDashboardData(chartConfig, dataSources);

  const columns = useMemo(() => {
    if (rows.length === 0) return [];
    return Object.keys(rows[0]).slice(0, 8).map((key) => ({
      title: key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
      dataIndex: key,
      key,
      ellipsis: true,
      render: (val: any) => {
        if (val == null) return '—';
        if (typeof val === 'number') return Number.isInteger(val) ? val : Number(val).toFixed(2);
        return String(val);
      },
    }));
  }, [rows]);

  const height = Number(chartConfig.height || 320);
  if (rows.length === 0) {
    return <Empty description="No data" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 20 }} />;
  }
  return (
    <div style={{ maxHeight: height, overflow: 'auto' }}>
      <Table
        dataSource={rows.map((r: any, i: number) => ({ ...r, _rowKey: r.id ?? r.key ?? i }))}
        columns={columns}
        rowKey="_rowKey"
        size="small"
        pagination={false}
      />
    </div>
  );
}
