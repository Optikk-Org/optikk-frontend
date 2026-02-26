import { Tabs } from 'antd';
import { Bell, AlertTriangle } from 'lucide-react';
import { useTabSync } from '@hooks/useTabSync';
import AlertsPage from './AlertsPage';
import IncidentsPage from './IncidentsPage';

/**
 * AlertsHubPage - Refactored to use useTabSync hook (DRY principle)
 * Manages alerts and incidents tabs with URL synchronization
 */
export default function AlertsHubPage() {
  const { activeTab, onTabChange } = useTabSync('alerts');

  const items = [
    {
      key: 'alerts',
      label: <span><Bell size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Alerts</span>,
      children: <AlertsPage />,
    },
    {
      key: 'incidents',
      label: <span><AlertTriangle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Incidents</span>,
      children: <IncidentsPage />,
    },
  ];

  return <Tabs activeKey={activeTab} onChange={onTabChange} items={items} />;
}
