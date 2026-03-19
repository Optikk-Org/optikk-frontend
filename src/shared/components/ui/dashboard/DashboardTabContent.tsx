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
  const { data, isLoading, hasError, failedRequests } = useComponentDataFetcher(components, pathParams);

  return (
    <div className="dashboard-tab-content page-section">
      {hasError && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(240,68,56,0.08)', border: '1px solid rgba(240,68,56,0.3)', color: '#f04438' }}>
            <strong>Some dashboard data could not be loaded</strong>
            <div style={{ marginTop: 4, fontSize: 13, opacity: 0.85 }}>
              {failedRequests
                .map((request) => `${request.method} ${request.endpoint}: ${request.error.message}`)
                .join(' ')}
            </div>
          </div>
        </div>
      )}
      <ConfigurableDashboard
        config={{ components, groups }}
        dataSources={data}
        isLoading={isLoading}
      />
    </div>
  );
}
