import { BarChart3 } from 'lucide-react';
import { lazy } from 'react';

import type { DomainConfig } from '@/app/registry/domainRegistry';
import { ROUTES } from '@/shared/constants/routes';

const MetricsExplorerPage = lazy(() =>
  import('./pages/MetricsExplorerPage').then((module) => ({ default: module.default }))
);
const KafkaTopicDetailPage = lazy(() =>
  import('./pages/KafkaTopicDetailPage').then((module) => ({ default: module.default }))
);
const KafkaGroupDetailPage = lazy(() =>
  import('./pages/KafkaGroupDetailPage').then((module) => ({ default: module.default }))
);

export /**
 *
 */
const metricsConfig: DomainConfig = {
  key: 'metrics',
  label: 'Metrics',
  permissions: ['metrics:read'],
  navigation: [
    {
      path: ROUTES.metrics,
      label: 'Metrics',
      icon: BarChart3,
      group: 'observe',
    },
  ],
  routes: [{ path: ROUTES.metrics, page: MetricsExplorerPage }],
  dashboardPages: [
    { pageId: 'kafka-topic-detail', page: KafkaTopicDetailPage },
    { pageId: 'kafka-group-detail', page: KafkaGroupDetailPage },
  ],
  dashboardPanels: [],
};
export * from './components';
export * from './utils';
export * from './types';
