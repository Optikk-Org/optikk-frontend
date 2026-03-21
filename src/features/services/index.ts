import { Server } from 'lucide-react';
import { lazy } from 'react';

import type { DomainConfig } from '@/app/registry/domainRegistry';
import { ROUTES } from '@/shared/constants/routes';

const ServicesPage = lazy(() =>
  import('./pages/ServicesPage').then((module) => ({ default: module.default })),
);
const ServiceDetailPage = lazy(() =>
  import('./pages/ServiceDetailPage').then((module) => ({ default: module.default })),
);

export /**
 *
 */
const servicesConfig: DomainConfig = {
  key: 'services',
  label: 'Services',
  permissions: ['services:read'],
  navigation: [
    {
      path: ROUTES.services,
      label: 'Services',
      icon: Server,
      group: 'observe',
    },
  ],
  routes: [
    { path: ROUTES.services, page: ServicesPage },
    { path: ROUTES.serviceDetail, page: ServiceDetailPage },
  ],
};

export { default as ServicesPageView } from './pages/ServicesPage';
export { default as ServiceDetailPageView } from './pages/ServiceDetailPage';
export * from './components/detail';
export * from './components/services-page/ServiceOverviewTab';
export * from './components/services-page/ServiceTopologyTab';
export { useServicesData } from './hooks/useServicesData';
export * from './utils/servicesUtils';
