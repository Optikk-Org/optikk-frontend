import { BarChart3, Gauge } from 'lucide-react';
import { lazy } from 'react';

import type { DomainConfig } from '@/app/registry/domainRegistry';
import { ROUTES } from '@/shared/constants/routes';

const MetricsPage = lazy(() =>
  import('./pages/MetricsPage').then((module) => ({ default: module.default })),
);
const SaturationHubPage = lazy(() =>
  import('./pages/SaturationHubPage').then((module) => ({ default: module.default })),
);
const KafkaTopicDetailPage = lazy(() =>
  import('./pages/KafkaTopicDetailPage').then((module) => ({ default: module.default })),
);
const KafkaGroupDetailPage = lazy(() =>
  import('./pages/KafkaGroupDetailPage').then((module) => ({ default: module.default })),
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
    {
      path: ROUTES.saturation,
      label: 'Saturation',
      icon: Gauge,
      group: 'operate',
    },
  ],
  routes: [
    { path: ROUTES.metrics, page: MetricsPage },
    { path: ROUTES.saturation, page: SaturationHubPage },
    { path: ROUTES.kafkaTopicDetail, page: KafkaTopicDetailPage },
    { path: ROUTES.kafkaGroupDetail, page: KafkaGroupDetailPage },
  ],
};

export { default as MetricsPageView } from './pages/MetricsPage';
export { default as SaturationHubPageView } from './pages/SaturationHubPage';
export { default as SaturationPageView } from './pages/SaturationPage';
export { default as LatencyAnalysisPageView } from './pages/LatencyAnalysisPage';
export { default as ResourceUtilizationPageView } from './pages/ResourceUtilizationPage';


export { default as MessagingQueueMonitoringPageView } from './pages/MessagingQueueMonitoringPage';
export { default as KafkaTopicDetailPageView } from './pages/KafkaTopicDetailPage';
export { default as KafkaGroupDetailPageView } from './pages/KafkaGroupDetailPage';
export * from './components';
export * from './utils';
export * from './types';
