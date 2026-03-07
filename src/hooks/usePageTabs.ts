import { useQuery } from '@tanstack/react-query';

import type { DefaultConfigTab } from '@/types/dashboardConfig';

import { defaultConfigService } from '@services/defaultConfigService';

import { useAppStore } from '@store/appStore';

interface UsePageTabsResult {
  tabs: DefaultConfigTab[];
  isLoading: boolean;
  error: Error | null;
}

/**
 *
 */
export function usePageTabs(pageId: string): UsePageTabsResult {
  const { selectedTeamId } = useAppStore();

  const { data, isLoading, error } = useQuery<DefaultConfigTab[], Error>({
    queryKey: ['default-config', 'tabs', selectedTeamId, pageId],
    queryFn: () => defaultConfigService.listPageTabs(selectedTeamId, pageId),
    enabled: !!selectedTeamId && !!pageId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    tabs: data ?? [],
    isLoading,
    error: error ?? null,
  };
}
