import { useMemo } from 'react';

import type { DashboardRenderConfig } from '@/types/dashboardConfig';

import { usePageTabs } from './usePageTabs';
import { useTabComponents } from './useTabComponents';

interface UseDashboardConfigResult {
  config: DashboardRenderConfig | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 *
 */
export function useDashboardConfig(pageId: string): UseDashboardConfigResult {
  const { tabs, isLoading: tabsLoading, error: tabsError } = usePageTabs(pageId);
  const defaultTabId = tabs[0]?.id ?? '';
  const {
    components,
    groups,
    isLoading: componentsLoading,
    error: componentsError,
  } = useTabComponents(pageId, defaultTabId);

  const config = useMemo<DashboardRenderConfig | null>(() => {
    if (!defaultTabId) {
      return null;
    }
    return {
      components: components.map((component) => ({
        ...component,
        dataSource: component.dataSource || component.id,
      })),
      groups,
    };
  }, [components, groups, defaultTabId]);

  return {
    config,
    isLoading: tabsLoading || componentsLoading,
    error: tabsError ?? componentsError ?? null,
  };
}
