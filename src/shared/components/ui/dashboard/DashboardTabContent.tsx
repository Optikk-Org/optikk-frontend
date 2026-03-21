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
 * Per-component errors are passed down so each chart card can show its own error overlay.
 */
export default function DashboardTabContent({
  components,
  groups,
  pathParams,
}: DashboardTabContentProps) {
  const { data, isLoading, errors } = useComponentDataFetcher(components, pathParams);

  return (
    <div className="dashboard-tab-content page-section">
      <ConfigurableDashboard
        config={{ components, groups }}
        dataSources={data}
        errors={errors}
        isLoading={isLoading}
      />
    </div>
  );
}
