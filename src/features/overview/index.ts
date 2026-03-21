import { LayoutDashboard } from 'lucide-react';
import { lazy } from 'react';

import type { DomainConfig } from '@/app/registry/domainRegistry';
import { ROUTES } from '@/shared/constants/routes';

const OverviewHubPage = lazy(() =>
  import('./pages/OverviewHubPage').then((module) => ({ default: module.default })),
);
const ErrorDashboardPage = lazy(() =>
  import('./pages/ErrorDashboardPage').then((module) => ({ default: module.default })),
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
  routes: [
    { path: ROUTES.overview, page: OverviewHubPage },
    { path: ROUTES.errors, page: ErrorDashboardPage },
  ],
};

export { default as OverviewHubPageView } from './pages/OverviewHubPage';
export { default as ErrorDashboardPageView } from './pages/ErrorDashboardPage';
export * from './components';
export * from './types';
