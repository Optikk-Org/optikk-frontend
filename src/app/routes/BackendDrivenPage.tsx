import { Navigate, useLocation } from 'react-router-dom';
import { Skeleton } from 'antd';

import DashboardPage from '@components/dashboard/DashboardPage';
import { usePagesConfig } from '@hooks/usePagesConfig';
import { ROUTES } from '@/shared/constants/routes';
import { AiObservabilityPageView } from '@/domains/ai';
import { InfrastructureHubPageView } from '@/domains/infrastructure';
import { LogsHubPageView } from '@/domains/log';
import { ServicesPageView } from '@/domains/services';
import { TracesPageView } from '@/domains/traces';

const CUSTOM_SHELLS = {
  'ai-observability': AiObservabilityPageView,
  infrastructure: InfrastructureHubPageView,
  logs: LogsHubPageView,
  services: ServicesPageView,
  traces: TracesPageView,
} as const;

export default function BackendDrivenPage(): JSX.Element {
  const location = useLocation();
  const { pages, isLoading } = usePagesConfig();

  if (isLoading && pages.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  const matchedPage = pages.find((page) => page.path === location.pathname);
  if (!matchedPage) {
    return <Navigate to={pages[0]?.path || ROUTES.overview} replace />;
  }

  const Shell = CUSTOM_SHELLS[matchedPage.id as keyof typeof CUSTOM_SHELLS];
  if (Shell) {
    return <Shell />;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      <DashboardPage pageId={matchedPage.id} />
    </div>
  );
}
