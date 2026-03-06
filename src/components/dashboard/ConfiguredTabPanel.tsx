import { Skeleton } from 'antd';

import DashboardTabContent from './DashboardTabContent';
import { useTabComponents } from '@hooks/useTabComponents';

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
  const { components, isLoading } = useTabComponents(pageId, tabId);

  if (isLoading && components.length === 0) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  return <DashboardTabContent components={components} pathParams={pathParams} />;
}
