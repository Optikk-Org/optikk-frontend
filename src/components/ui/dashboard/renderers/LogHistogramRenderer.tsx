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
export function LogHistogramRenderer({
  chartConfig,
  dataSources,
  extraContext,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
  extraContext?: DashboardExtraContext;
}) {
  const { rawData } = useDashboardData(chartConfig, dataSources);
  const { startTime, endTime } = extraContext || {};
  const data = useMemo(() => {
    const key = chartConfig.dataKey;
    const arr = key ? rawData?.[key] : rawData;
    return Array.isArray(arr) ? arr : [];
  }, [rawData, chartConfig.dataKey]);

  const height = chartConfig.height || 120;
  return data.length > 0
    ? <LogHistogram data={data} height={height} startTime={startTime} endTime={endTime} />
    : <Empty description="No log data" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 20 }} />;
}
