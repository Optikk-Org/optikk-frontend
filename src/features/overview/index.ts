import { LayoutDashboard } from 'lucide-react';
import { lazy } from 'react';

import type { DomainConfig } from '@/app/registry/domainRegistry';
import { ROUTES } from '@/shared/constants/routes';

const OverviewHubPage = lazy(() =>
  import('./pages/OverviewHubPage').then((module) => ({ default: module.default }))
);
const ErrorDashboardPage = lazy(() =>
  import('./pages/ErrorDashboardPage').then((module) => ({ default: module.default }))
);
const ServiceHealthGridRenderer = lazy(() =>
  import('./dashboard/renderers/ServiceHealthGridRenderer').then((module) => ({
    default: module.ServiceHealthGridRenderer,
  }))
);
const SloIndicatorsRenderer = lazy(() =>
  import('./dashboard/renderers/SloIndicatorsRenderer').then((module) => ({
    default: module.SloIndicatorsRenderer,
  }))
);
const ErrorHotspotRankingRenderer = lazy(() =>
  import('./dashboard/renderers/ErrorHotspotRankingRenderer').then((module) => ({
    default: module.ErrorHotspotRankingRenderer,
  }))
);

export /**
 *
 */
const overviewConfig: DomainConfig = {
  key: 'overview',
  label: 'Overview',
  permissions: ['overview:read'],
  navigation: [
    {
      path: ROUTES.overview,
      label: 'Overview',
      icon: LayoutDashboard,
      group: 'observe',
    },
  ],
  routes: [{ path: ROUTES.errors, page: ErrorDashboardPage }],
  dashboardPages: [{ pageId: 'overview', page: OverviewHubPage }],
  dashboardPanels: [
    { panelType: 'service-health-grid', kind: 'specialized', component: ServiceHealthGridRenderer },
    { panelType: 'slo-indicators', kind: 'specialized', component: SloIndicatorsRenderer },
    {
      panelType: 'error-hotspot-ranking',
      kind: 'specialized',
      component: ErrorHotspotRankingRenderer,
    },
  ],
};
export * from './components';
export * from './types';
