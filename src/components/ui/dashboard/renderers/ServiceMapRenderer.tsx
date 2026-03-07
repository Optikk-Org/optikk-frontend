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
export function ServiceMapRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
}) {
  const { rawData } = useDashboardData(chartConfig, dataSources);
  const nodes = useMemo(() => (rawData as any)?.nodes ?? [], [rawData]);
  const edges = useMemo(() => (rawData as any)?.edges ?? [], [rawData]);
  const height = Number(chartConfig.height || 560);

  if (nodes.length === 0) {
    return <Empty description="No topology data" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 20 }} />;
  }
  return (
    <div style={{ height }}>
      <ServiceGraph nodes={nodes} edges={edges} />
    </div>
  );
}
