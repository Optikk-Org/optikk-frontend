import { Skeleton } from '@/components/ui';
import { Navigate, useLocation } from 'react-router-dom';

import { resolveRegisteredDomainRoute } from '@/app/registry/domainRegistry';
import { ROUTES } from '@/shared/constants/routes';

import { DashboardPage } from '@shared/components/ui';

import { usePagesConfig } from '@shared/hooks/usePagesConfig';

export default function BackendDrivenPage(): JSX.Element {
  const location = useLocation();
  const { pages, isLoading, error } = usePagesConfig();

  // Still fetching on first load — show skeleton.
  if (isLoading && pages.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  // Query failed and no cached pages — redirect to root so the app doesn't
  // get stuck on a skeleton indefinitely.
  if (error && pages.length === 0) {
    return <Navigate to={ROUTES.overview} replace />;
  }

  const matchedPage = pages.find((page) => page.path === location.pathname);
  if (!matchedPage) {
    return <Navigate to={pages[0]?.path || ROUTES.overview} replace />;
  }

  const registeredRoute = resolveRegisteredDomainRoute(matchedPage.path);
  if (registeredRoute) {
    const Page = registeredRoute.page;
    return <Page />;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      <DashboardPage pageId={matchedPage.id} />
    </div>
  );
}
