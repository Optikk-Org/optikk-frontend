import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import ServiceDetailPage from '@/pages/services/ServiceDetailPage';
import SettingsPage from '@/pages/settings';
import TraceDetailPage from '@/pages/traces/TraceDetailPage';
import { ErrorBoundary, Loading } from '@/shared/components/ui/feedback';
import { ROUTES } from '@/shared/constants/routes';

import BackendDrivenPage from './BackendDrivenPage';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layout/MainLayout';

const LoginPage = lazy(() => import('@/app/auth'));

function toNestedRoutePath(path: string): string {
  if (!path || path === ROUTES.home) {
    return '';
  }
  return path.startsWith('/') ? path.slice(1) : path;
}

export default function AppRoutes(): JSX.Element {
  return (
    <Routes>
      <Route
        path={ROUTES.login}
        element={(
          <Suspense fallback={<Loading fullscreen />}>
            <LoginPage />
          </Suspense>
        )}
      />

      <Route
        path={ROUTES.home}
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={ROUTES.overview} replace />} />
        <Route
          path={toNestedRoutePath(ROUTES.settings)}
          element={(
            <ErrorBoundary>
              <SettingsPage />
            </ErrorBoundary>
          )}
        />
        <Route
          path={toNestedRoutePath(ROUTES.traceDetail)}
          element={(
            <ErrorBoundary>
              <TraceDetailPage />
            </ErrorBoundary>
          )}
        />
        <Route
          path={toNestedRoutePath(ROUTES.serviceDetail)}
          element={(
            <ErrorBoundary>
              <ServiceDetailPage />
            </ErrorBoundary>
          )}
        />
        <Route
          path="errors"
          element={<Navigate to={`${ROUTES.overview}?tab=errors`} replace />}
        />
        <Route
          path={toNestedRoutePath(ROUTES.latencyAlias)}
          element={<Navigate to={`${ROUTES.metrics}?tab=latency-analysis`} replace />}
        />
        <Route
          path="service-map"
          element={<Navigate to={`${ROUTES.services}?tab=service-map`} replace />}
        />
        <Route
          path="*"
          element={(
            <ErrorBoundary>
              <BackendDrivenPage />
            </ErrorBoundary>
          )}
        />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  );
}
