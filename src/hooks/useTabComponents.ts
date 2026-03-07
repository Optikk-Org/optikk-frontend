import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { DashboardComponentSpec } from '@/types/dashboardConfig';

import { defaultConfigService } from '@services/defaultConfigService';

import { useAppStore } from '@store/appStore';

interface UseTabComponentsResult {
  components: DashboardComponentSpec[];
  isLoading: boolean;
  error: Error | null;
}

/**
 *
 */
export function useTabComponents(pageId: string, tabId: string): UseTabComponentsResult {
  const { selectedTeamId } = useAppStore();

  const { data, isLoading, error } = useQuery<DashboardComponentSpec[], Error>({
    queryKey: ['default-config', 'components', selectedTeamId, pageId, tabId],
    queryFn: () => defaultConfigService.listTabComponents(selectedTeamId, pageId, tabId),
    enabled: !!selectedTeamId && !!pageId && !!tabId,
    staleTime: 5 * 60 * 1000,
  });

  const components = useMemo(
    () => (data ?? []).map((component) => ({
      ...component,
      dataSource: component.dataSource || component.id,
    })),
    [data],
  );

  return {
    components,
    isLoading,
    error: error ?? null,
  };
}
