import { Tabs } from '@shared/design-system';
import { Database, Network } from 'lucide-react';

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
    <div>
      <Tabs
        activeKey={activeTab}
        onChange={onTabChange}
        items={[
          { key: 'database', label: 'Database', icon: <Database size={14} /> },
          { key: 'mq', label: 'Messaging Queue', icon: <Network size={14} /> },
        ]}
      />

      {activeTab === 'database' && <ConfiguredTabPanel pageId="saturation" tabId="database" />}
      {activeTab === 'mq' && <MessagingQueueMonitoringPage />}
    </div>
  );
}
