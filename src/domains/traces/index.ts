import { lazy } from 'react';
import { GitBranch } from 'lucide-react';

import type { DomainConfig } from '@/app/registry/domainRegistry';
import { ROUTES } from '@/shared/constants/routes';

const TracesPage = lazy(() =>
  import('./pages/TracesPage').then((module) => ({ default: module.default })),
);
const TraceDetailPage = lazy(() =>
  import('./pages/TraceDetailPage').then((module) => ({ default: module.default })),
);

export const tracesConfig: DomainConfig = {
  key: 'traces',
  label: 'Traces',
  permissions: ['traces:read'],
  navigation: [
    {
      path: ROUTES.traces,
      label: 'Traces',
      icon: GitBranch,
      group: 'observe',
    },
  ],
  routes: [
    { path: ROUTES.traces, page: TracesPage },
    { path: ROUTES.traceDetail, page: TraceDetailPage },
  ],
};

export { default as TracesPageView } from './pages/TracesPage';
export { default as TraceDetailPageView } from './pages/TraceDetailPage';
export * from './components';
export type { ServiceBadge, TraceColumn, TraceRecord } from './types';
