import { useQuery } from '@tanstack/react-query';
import yaml from 'js-yaml';
import { v1Service } from '@services/v1Service';
import { useAppStore } from '@store/appStore';

/**
 * Fetches and parses the YAML dashboard config for a page.
 * Returns { config, isLoading, error }.
 */
export function useDashboardConfig(pageId) {
  const { selectedTeamId } = useAppStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-config', selectedTeamId, pageId],
    queryFn: () => v1Service.getDashboardConfig(selectedTeamId, pageId),
    enabled: !!selectedTeamId && !!pageId,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  let config = null;
  if (data?.configYaml) {
    try {
      config = yaml.load(data.configYaml);
    } catch (e) {
      console.error('Failed to parse dashboard YAML config:', e);
    }
  }

  return { config, isLoading, error };
}
