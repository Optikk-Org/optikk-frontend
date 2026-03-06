import type { ComponentType, LazyExoticComponent } from 'react';
import type { LucideIcon } from 'lucide-react';

import { aiConfig } from '@/domains/ai';
import { infrastructureConfig } from '@/domains/infrastructure';
import { logsConfig } from '@/domains/logs';
import { metricsConfig } from '@/domains/metrics';
import { overviewConfig } from '@/domains/overview';
import { servicesConfig } from '@/domains/services';
import { settingsConfig } from '@/domains/settings';
import { tracesConfig } from '@/domains/traces';

export type DomainPage =
  | ComponentType<any>
  | LazyExoticComponent<ComponentType<any>>;

export interface DomainNavigationItem {
  readonly path: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly group: string;
}

export interface DomainRouteConfig {
  readonly path: string;
  readonly page: DomainPage;
}

export interface DomainConfig {
  readonly key: string;
  readonly label: string;
  readonly permissions: readonly string[];
  readonly navigation: readonly DomainNavigationItem[];
  readonly routes: readonly DomainRouteConfig[];
}

export const domainRegistry: readonly DomainConfig[] = [
  overviewConfig,
  metricsConfig,
  logsConfig,
  tracesConfig,
  servicesConfig,
  infrastructureConfig,
  aiConfig,
  settingsConfig,
] as const;
