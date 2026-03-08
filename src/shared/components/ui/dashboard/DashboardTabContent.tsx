import type { ComponentGroup, DashboardComponentSpec } from '@/types/dashboardConfig';

import { useComponentDataFetcher } from '@shared/hooks/useComponentDataFetcher';

import ConfigurableDashboard from './ConfigurableDashboard';

interface DashboardTabContentProps {
  components: DashboardComponentSpec[];
  groups?: ComponentGroup[];
  pathParams?: Record<string, string>;
}

/**
 * Renders a single tab's content by fetching each component's query contract.
 */
export default function DashboardTabContent({
  components,
  groups,
  pathParams,
}: DashboardTabContentProps) {
  const { data } = useComponentDataFetcher(components, pathParams);

  return (
    <div className="dashboard-tab-content page-section">
      <ConfigurableDashboard
        config={{ components, groups }}
        dataSources={data}
      />
    </div>
  );
}
