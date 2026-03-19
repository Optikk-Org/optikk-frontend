import { Tabs } from 'antd';
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

  const items = [
    {
      key: 'database',
      label: (
        <span>
          <Database size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Database
        </span>
      ),
      children: <ConfiguredTabPanel pageId="saturation" tabId="database" />,
    },
    {
      key: 'mq',
      label: (
        <span>
          <Network size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Messaging Queue
        </span>
      ),
      children: <MessagingQueueMonitoringPage />,
    },
  ];

  return <Tabs activeKey={activeTab} onChange={onTabChange} items={items} />;
}
