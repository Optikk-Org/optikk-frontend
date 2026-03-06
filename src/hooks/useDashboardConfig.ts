import { useQuery } from '@tanstack/react-query';
import yaml from 'js-yaml';

import { dashboardConfigService } from '@services/dashboardConfigService';
import type {
  DashboardComponentSpec,
  DashboardConfigApiResponse,
  DashboardRenderConfig,
} from '@/types/dashboardConfig';

import { useAppStore } from '@store/appStore';

interface UseDashboardConfigResult {
  config: DashboardRenderConfig | null;
  isLoading: boolean;
  error: Error | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isComponentLike(record: Record<string, unknown>): boolean {
  return Boolean(
    asNonEmptyString(record.componentKey)
    || asNonEmptyString(record.type)
    || asNonEmptyString(record.key),
  );
}

function normalizeComponent(
  component: unknown,
  fallbackId: string,
): DashboardComponentSpec | null {
  if (!isRecord(component)) {
    return null;
  }

  const componentKey = asNonEmptyString(component.componentKey)
    || asNonEmptyString(component.key)
    || asNonEmptyString(component.type);

  if (!componentKey) {
    return null;
  }

  const id = asNonEmptyString(component.id) || fallbackId;
  return {
    ...component,
    id,
    componentKey,
  };
}

function normalizeComponents(rawComponents: unknown): DashboardComponentSpec[] {
  if (Array.isArray(rawComponents)) {
    return rawComponents
      .map((component, index) => normalizeComponent(component, `component-${index}`))
      .filter((component): component is DashboardComponentSpec => component !== null);
  }

  if (!isRecord(rawComponents)) {
    return [];
  }

  if (isComponentLike(rawComponents)) {
    const normalized = normalizeComponent(rawComponents, 'component-0');
    return normalized ? [normalized] : [];
  }

  return Object.entries(rawComponents)
    .map(([id, component], index) => normalizeComponent(component, asNonEmptyString(id) || `component-${index}`))
    .filter((component): component is DashboardComponentSpec => component !== null);
}

function parseYamlConfig(configYaml: unknown): Record<string, unknown> | null {
  if (typeof configYaml !== 'string' || configYaml.length === 0) {
    return null;
  }

  try {
    const parsed = yaml.load(configYaml);
    return isRecord(parsed) ? parsed : null;
  } catch (error) {
    console.error('Failed to parse dashboard YAML config:', error);
    return null;
  }
}

function buildRenderConfig(data: unknown): DashboardRenderConfig | null {
  if (!isRecord(data)) {
    return null;
  }

  const response = data as DashboardConfigApiResponse;
  const parsedYamlConfig = parseYamlConfig(response.configYaml);
  const rawConfig: Record<string, unknown> = parsedYamlConfig
    ? { ...response, ...parsedYamlConfig }
    : response;

  const rawComponents = rawConfig.components ?? rawConfig.charts;
  const components = normalizeComponents(rawComponents);

  return {
    ...rawConfig,
    components,
  };
}

/**
 * Fetches and parses the YAML dashboard config for a page.
 * Returns { config, isLoading, error }.
 * @param pageId
 */
export function useDashboardConfig(pageId: string): UseDashboardConfigResult {
  const { selectedTeamId } = useAppStore();

  const { data, isLoading, error } = useQuery<DashboardConfigApiResponse, Error>({
    queryKey: ['dashboard-config', selectedTeamId, pageId],
    queryFn: () => dashboardConfigService.getDashboardConfig(selectedTeamId, pageId),
    enabled: !!selectedTeamId && !!pageId,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  const config = buildRenderConfig(data);

  return { config, isLoading, error: error ?? null };
}
