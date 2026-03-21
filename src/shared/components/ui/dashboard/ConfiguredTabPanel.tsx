import { Skeleton } from '@/components/ui';

import { useTabComponents } from '@shared/hooks/useTabComponents';

import DashboardTabContent from './DashboardTabContent';

interface ConfiguredTabPanelProps {
  pageId: string;
  tabId: string;
  pathParams?: Record<string, string>;
}

export default function ConfiguredTabPanel({
  pageId,
  tabId,
  pathParams,
}: ConfiguredTabPanelProps) {
  const { components, groups, isLoading } = useTabComponents(pageId, tabId);

  if (isLoading && components.length === 0) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  return <DashboardTabContent components={components} groups={groups} pathParams={pathParams} />;
}
