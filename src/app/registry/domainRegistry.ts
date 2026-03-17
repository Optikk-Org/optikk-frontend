import { aiConfig } from '@/features/ai';
import { infrastructureConfig } from '@/features/infrastructure';
import { logsConfig } from '@/features/log';
import { metricsConfig } from '@/features/metrics';
import { overviewConfig } from '@/features/overview';
import { servicesConfig } from '@/features/services';
import { settingsConfig } from '@/features/settings';
import { tracesConfig } from '@/features/traces';
import { matchPath } from 'react-router-dom';

import type { LucideIcon } from 'lucide-react';
import type { ComponentType, LazyExoticComponent } from 'react';
import type { AppRoutePath } from '@/shared/constants/routes';

/**
 *
 */
type DomainPage =
  | ComponentType<object>
  | LazyExoticComponent<ComponentType<object>>;

/**
 *
 */
export interface DomainNavigationItem {
  readonly path: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly group: string;
}

/**
 *
 */
export interface DomainRouteConfig {
  readonly path: AppRoutePath;
  readonly page: DomainPage;
}

/**
 *
 */
export interface DomainConfig {
  readonly key: string;
  readonly label: string;
  readonly permissions: readonly string[];
  readonly navigation: readonly DomainNavigationItem[];
  readonly routes: readonly DomainRouteConfig[];
}

export /**
 *
 */
const domainRegistry: readonly DomainConfig[] = [
  overviewConfig,
  metricsConfig,
  logsConfig,
  tracesConfig,
  servicesConfig,
  infrastructureConfig,
  aiConfig,
  settingsConfig,
] as const;

export interface RegisteredDomainRoute extends DomainRouteConfig {
  readonly domainKey: string;
  readonly label: string;
  readonly permissions: readonly string[];
}

export function getDomainNavigationItems(): readonly DomainNavigationItem[] {
  return domainRegistry.flatMap((domain) => domain.navigation);
}

export function getDomainRoutes(): readonly RegisteredDomainRoute[] {
  return domainRegistry.flatMap((domain) =>
    domain.routes.map((route) => ({
      ...route,
      domainKey: domain.key,
      label: domain.label,
      permissions: domain.permissions,
    })),
  );
}

export function resolveRegisteredDomainRoute(
  pathname: string,
): RegisteredDomainRoute | null {
  return (
    getDomainRoutes().find((route) =>
      matchPath({ path: route.path, end: true }, pathname),
    ) ?? null
  );
}
