import type {
  DashboardComponentSpec,
  DashboardDataSources,
  DashboardExtraContext,
} from '@/types/dashboardConfig';

import type { ComponentType } from 'react';

export { getDashboardIcon } from './utils/dashboardUtils';

export * from './renderers/LogHistogramRenderer';
export * from './renderers/LatencyHistogramRenderer';
export * from './renderers/LatencyHeatmapRenderer';
export * from './renderers/AiLineRenderer';
export * from './renderers/AiBarRenderer';
export * from './renderers/TableRenderer';
export * from './renderers/BarRenderer';
export * from './renderers/PieRenderer';
export * from './renderers/AreaRenderer';
export * from './renderers/GaugeRenderer';
export * from './renderers/ScorecardRenderer';
export * from './renderers/HeatmapRenderer';
export * from './renderers/ServiceMapRenderer';
export * from './renderers/TraceWaterfallRenderer';
export * from './renderers/DbSystemsRenderer';

/**
 *
 */
export type SpecializedDashboardRenderer = ComponentType<{
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
  extraContext?: DashboardExtraContext;
}>;
