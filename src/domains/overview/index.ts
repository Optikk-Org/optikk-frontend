import { lazy } from 'react';
import { LayoutDashboard } from 'lucide-react';

import type { DomainConfig } from '@/app/registry/domainRegistry';
import { ROUTES } from '@/shared/constants/routes';

const OverviewPage = lazy(() =>
  import('./pages/OverviewHubPage').then((module) => ({ default: module.default })),
);
const ErrorDashboardPage = lazy(() =>
  import('./pages/ErrorDashboardPage').then((module) => ({ default: module.default })),
);

export const overviewConfig: DomainConfig = {
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
    { path: ROUTES.overview, page: OverviewPage },
    { path: ROUTES.errors, page: ErrorDashboardPage },
  ],
};

export { default as OverviewHubPageView } from './pages/OverviewHubPage';
export { default as OverviewPageView } from './pages/OverviewPage';
export { default as SloSliDashboardPageView } from './pages/SloSliDashboardPage';
export { default as ErrorDashboardPageView } from './pages/ErrorDashboardPage';
export * from './components';
export * from './types';
