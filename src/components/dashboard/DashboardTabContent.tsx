import { Spin } from 'antd';

import type { DashboardComponentSpec } from '@/types/dashboardConfig';

import { useComponentDataFetcher } from '@hooks/useComponentDataFetcher';

import ConfigurableDashboard from './ConfigurableDashboard';

interface DashboardTabContentProps {
  components: DashboardComponentSpec[];
  pathParams?: Record<string, string>;
}

/**
 * Renders a single tab's content by fetching each component's query contract.
 */
export default function DashboardTabContent({
  components,
  pathParams,
}: DashboardTabContentProps) {
  const { data, isLoading } = useComponentDataFetcher(components, pathParams);

  return (
    <Spin spinning={isLoading}>
      <ConfigurableDashboard
        config={{ components }}
        dataSources={data}
        isLoading={isLoading}
      />
    </Spin>
  );
}
