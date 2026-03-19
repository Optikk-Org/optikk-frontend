import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { ComponentGroup, DashboardComponentSpec } from '@/types/dashboardConfig';

import { defaultConfigService } from '@shared/api/defaultConfigService';

import { useAppStore } from '@store/appStore';

interface UseTabComponentsResult {
  components: DashboardComponentSpec[];
  groups: ComponentGroup[];
  isLoading: boolean;
  error: Error | null;
}

/**
 *
 */
export function useTabComponents(pageId: string, tabId: string): UseTabComponentsResult {
  const { selectedTeamId } = useAppStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['default-config', 'components', selectedTeamId, pageId, tabId],
    queryFn: () => defaultConfigService.listTabComponents(selectedTeamId, pageId, tabId),
    enabled: !!selectedTeamId && !!pageId && !!tabId,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const components = useMemo(
    () => (data?.components ?? []).map((component) => ({
      ...component,
      dataSource: component.dataSource || component.id,
    })),
    [data],
  );

  const groups = useMemo(() => data?.groups ?? [], [data]);

  return {
    components,
    groups,
    isLoading,
    error: error ?? null,
  };
}
