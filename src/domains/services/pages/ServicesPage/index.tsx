import { Tabs } from 'antd';
import { Layers, Network } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '@components/common';

import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { useUrlSyncedTab } from '@hooks/useUrlSyncedTab';

import { ServiceOverviewTab } from '../../components/services-page/ServiceOverviewTab';
import { ServiceTopologyTab } from '../../components/services-page/ServiceTopologyTab';
import { useServicesData } from '../../hooks/useServicesData';

import type { ServiceSortField, ServiceSortOrder, ServiceViewMode } from '../../types';

import './ServicesPage.css';

/**
 *
 */
export default function ServicesPage() {
  const navigate = useNavigate();

  const { activeTab, onTabChange } = useUrlSyncedTab({
    allowedTabs: ['overview', 'topology'] as const,
    defaultTab: 'overview',
  });

  const [viewMode, setViewMode] = useState<ServiceViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [healthFilter, setHealthFilter] = useState('all');
  const sortField: ServiceSortField | null = null;
  const sortOrder: ServiceSortOrder | null = null;

  const { config: dashboardConfig } = useDashboardConfig('services');

  const {
    isLoading,
    chartDataSources,
    topologyLoading,
    topologyError,
    totalServices,
    healthyServices,
    degradedServices,
    unhealthyServices,
    tableData,
    topologyNodes,
    topologyEdges,
    topologyStats,
    criticalServices,
    dependencyRows,
    healthOptions,
  } = useServicesData({ searchQuery, sortField, sortOrder, healthFilter });

  const onNodeClick = (name: string): void => {
    navigate(`/services/${encodeURIComponent(name)}`);
  };

  return (
    <div className="services-page">
      <PageHeader
        title="Services"
        subtitle="Global service health and dependency topology"
        icon={<Layers size={24} />}
      />

      <Tabs
        activeKey={activeTab}
        onChange={onTabChange}
        className="services-tabs"
        items={[
          {
            key: 'overview',
            label: <span><Layers size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Overview</span>,
            children: (
              <ServiceOverviewTab
                totalServices={totalServices}
                healthyServices={healthyServices}
                degradedServices={degradedServices}
                unhealthyServices={unhealthyServices}
                isLoading={isLoading}
                dashboardConfig={dashboardConfig}
                chartDataSources={chartDataSources}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                viewMode={viewMode}
                setViewMode={setViewMode}
                tableData={tableData}
                onNodeClick={onNodeClick}
              />
            ),
          },
          {
            key: 'topology',
            label: <span><Network size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Topology</span>,
            children: (
              <ServiceTopologyTab
                topologyStats={topologyStats}
                topologyLoading={topologyLoading}
                topologyError={topologyError}
                topologyNodes={topologyNodes}
                topologyEdges={topologyEdges}
                criticalServices={criticalServices}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                healthFilter={healthFilter}
                setHealthFilter={setHealthFilter}
                healthOptions={healthOptions}
                dependencyRows={dependencyRows}
                onNodeClick={onNodeClick}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
