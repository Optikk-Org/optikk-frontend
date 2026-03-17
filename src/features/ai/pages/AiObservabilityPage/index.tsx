import { Tabs } from 'antd';
import { Activity, Brain, DollarSign, Eye, Shield, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';

import PageHeader from '@shared/components/ui/layout/PageHeader';
import ConfiguredTabPanel from '@shared/components/ui/dashboard/ConfiguredTabPanel';

import { usePageTabs } from '@shared/hooks/usePageTabs';

import './AiObservabilityPage.css';

/**
 *
 */
export default function AiObservabilityPage() {
  const { tabs } = usePageTabs('ai-observability');
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'overview');

  const tabItems = useMemo(() => tabs.map((tab) => {
    const icon = tab.id === 'overview'
      ? <Activity size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
      : tab.id === 'performance'
        ? <TrendingUp size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
        : tab.id === 'cost'
          ? <DollarSign size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          : tab.id === 'security'
            ? <Shield size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            : <Eye size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />;

    return {
      key: tab.id,
      label: <span>{icon}{tab.label}</span>,
      children: <ConfiguredTabPanel pageId="ai-observability" tabId={tab.id} />,
    };
  }), [tabs]);

  return (
    <div className="ai-observability-page">
      <PageHeader
        title="AI Observability"
        subtitle="Performance, cost, and security visibility for LLM / AI model calls"
        icon={<Brain size={24} />}
      />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="ai-tabs"
      />
    </div>
  );
}
