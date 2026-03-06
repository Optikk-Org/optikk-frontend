import { useQuery } from '@tanstack/react-query';
import yaml from 'js-yaml';

import { dashboardConfigService } from '@services/dashboardConfigService';

import { useAppStore } from '@store/appStore';

interface DashboardConfigData {
  configYaml?: string;
}

interface UseDashboardConfigResult {
  config: Record<string, unknown> | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Fetches and parses the YAML dashboard config for a page.
 * Returns { config, isLoading, error }.
 * @param pageId
 */
export function useDashboardConfig(pageId: string): UseDashboardConfigResult {
  const { selectedTeamId } = useAppStore();

  const { data, isLoading, error } = useQuery<unknown, Error>({
    queryKey: ['dashboard-config', selectedTeamId, pageId],
    queryFn: () => dashboardConfigService.getDashboardConfig(selectedTeamId, pageId),
    enabled: !!selectedTeamId && !!pageId,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  let config: Record<string, unknown> | null = null;
  const configData: DashboardConfigData | null =
    typeof data === 'object' && data !== null ? (data as DashboardConfigData) : null;

  if (typeof configData?.configYaml === 'string' && configData.configYaml.length > 0) {
    try {
      const parsed = yaml.load(configData.configYaml);
      if (typeof parsed === 'object' && parsed !== null) {
        config = parsed as Record<string, unknown>;
      }
    } catch (e) {
      console.error('Failed to parse dashboard YAML config:', e);
    }
  }

  return { config, isLoading, error: error ?? null };
}
