import { Tabs } from 'antd';
import { Layers, Network, Share2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { HealthSnapshotStrip, ServiceFlyInPanel } from '@shared/components/ui/calm';
import { useServiceHealthSummary } from '@features/overview/hooks/useServiceHealthSummary';

import { PageHeader } from '@shared/components/ui';
import ConfiguredTabPanel from '@shared/components/ui/dashboard/ConfiguredTabPanel';

import { usePageTabs } from '@shared/hooks/usePageTabs';
import { useUrlSyncedTab } from '@shared/hooks/useUrlSyncedTab';

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
  const { tabs } = usePageTabs('services');
  const allowedTabs = useMemo(
    () => (tabs.length > 0 ? tabs.map((tab) => tab.id) : ['overview']),
    [tabs],
  );

  const { activeTab, onTabChange } = useUrlSyncedTab({
    allowedTabs: allowedTabs as readonly string[],
    defaultTab: 'overview',
  });

  const [viewMode, setViewMode] = useState<ServiceViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [healthFilter, setHealthFilter] = useState('all');
  const [flyInService, setFlyInService] = useState<string | null>(null);

  const { data: healthSummary = [], isLoading: healthLoading } = useServiceHealthSummary();
  const sortField: ServiceSortField | null = null;
  const sortOrder: ServiceSortOrder | null = null;

  const {
    isLoading,
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

      <HealthSnapshotStrip
        services={healthSummary}
        onServiceClick={(name) => setFlyInService(name)}
        loading={healthLoading}
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
          {
            key: 'service-map',
            label: <span><Share2 size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Service Map</span>,
            children: <ConfiguredTabPanel pageId="services" tabId="service-map" />,
          },
        ]}
      />
      <ServiceFlyInPanel
        serviceName={flyInService}
        open={flyInService !== null}
        onClose={() => setFlyInService(null)}
      />
    </div>
  );
}
