import { Brain } from 'lucide-react';
import { lazy } from 'react';

import type { DomainConfig } from '@/app/registry/domainRegistry';
import { ROUTES } from '@/shared/constants/routes';

const AiPage = lazy(() =>
  import('./pages/AiObservabilityPage').then((module) => ({ default: module.default })),
);

export /**
 *
 */
const aiConfig: DomainConfig = {
  key: 'ai',
  label: 'AI Observability',
  permissions: ['ai:read'],
  navigation: [
    {
      path: ROUTES.aiObservability,
      label: 'AI Observability',
      icon: Brain,
      group: 'operate',
    },
  ],
  routes: [{ path: ROUTES.aiObservability, page: AiPage }],
};

export { default as AiObservabilityPageView } from './pages/AiObservabilityPage';
export * from './components';
export * from './types';
