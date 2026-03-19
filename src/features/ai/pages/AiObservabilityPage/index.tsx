import { Tabs } from '@shared/design-system';
import { Activity, Brain, DollarSign, Eye, Shield, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';

import PageHeader from '@shared/components/ui/layout/PageHeader';
import ConfiguredTabPanel from '@shared/components/ui/dashboard/ConfiguredTabPanel';

import { usePageTabs } from '@shared/hooks/usePageTabs';

import './AiObservabilityPage.css';

const TAB_ICONS: Record<string, typeof Activity> = {
  overview: Activity,
  performance: TrendingUp,
  cost: DollarSign,
  security: Shield,
};

export default function AiObservabilityPage() {
  const { tabs } = usePageTabs('ai-observability');
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || 'overview');

  const tabItems = useMemo(() => tabs.map((tab) => {
    const Icon = TAB_ICONS[tab.id] || Eye;
    return {
      key: tab.id,
      label: tab.label,
      icon: <Icon size={14} />,
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

      <ConfiguredTabPanel pageId="ai-observability" tabId={activeTab} />
    </div>
  );
}
