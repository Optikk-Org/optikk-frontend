import { useQuery } from '@tanstack/react-query';

import { defaultConfigService } from '@services/defaultConfigService';
import type { DefaultConfigPage } from '@/types/dashboardConfig';
import { useAppStore } from '@store/appStore';

interface UsePagesConfigResult {
  pages: DefaultConfigPage[];
  isLoading: boolean;
  error: Error | null;
}

export function usePagesConfig(): UsePagesConfigResult {
  const { selectedTeamId } = useAppStore();

  const { data, isLoading, error } = useQuery<DefaultConfigPage[], Error>({
    queryKey: ['default-config', 'pages', selectedTeamId],
    queryFn: () => defaultConfigService.listPages(selectedTeamId),
    enabled: !!selectedTeamId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    pages: data ?? [],
    isLoading,
    error: error ?? null,
  };
}
