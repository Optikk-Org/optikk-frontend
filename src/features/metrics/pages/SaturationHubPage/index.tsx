import { Tabs } from '@/components/ui';
import { Database, Gauge, Network } from 'lucide-react';

import { PageHeader, PageShell } from '@shared/components/ui';
import ConfiguredTabPanel from '@shared/components/ui/dashboard/ConfiguredTabPanel';
import { useUrlSyncedTab } from '@shared/hooks/useUrlSyncedTab';
import MessagingQueueMonitoringPage from '../MessagingQueueMonitoringPage';

/**
 * SaturationHubPage — groups the Database and Messaging Queue saturation tabs.
 * The Database tab is fully driven by backend JSON config (pageId=saturation, tabId=database)
 * so adding new charts only requires updating database.json — no frontend changes needed.
 */
export default function SaturationHubPage() {
  const { activeTab, onTabChange } = useUrlSyncedTab({
    allowedTabs: ['database', 'mq'] as const,
    defaultTab: 'database',
  });

  return (
    <PageShell>
      <PageHeader
        title="Saturation"
        subtitle="Track database and messaging bottlenecks with the same tab rhythm as the rest of the product."
        icon={<Gauge size={24} />}
      />
      <Tabs
        activeKey={activeTab}
        onChange={onTabChange}
        items={[
          { key: 'database', label: 'Database', icon: <Database size={14} /> },
          { key: 'mq', label: 'Messaging Queue', icon: <Network size={14} /> },
        ]}
        size="large"
        className="mb-[var(--space-md)]"
      />

      {activeTab === 'database' && <ConfiguredTabPanel pageId="saturation" tabId="database" />}
      {activeTab === 'mq' && <MessagingQueueMonitoringPage />}
    </PageShell>
  );
}
