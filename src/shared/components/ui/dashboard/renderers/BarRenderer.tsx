import type {
  DashboardComponentSpec,
  DashboardDataSources,
  DashboardExtraContext,
} from '@/types/dashboardConfig';

import { AiBarRenderer } from './AiBarRenderer';

/**
 *
 */
export function BarRenderer({
  chartConfig,
  dataSources,
  extraContext,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
  extraContext?: DashboardExtraContext;
}) {
  return <AiBarRenderer chartConfig={chartConfig} dataSources={dataSources} extraContext={extraContext ?? {}} />;
}
