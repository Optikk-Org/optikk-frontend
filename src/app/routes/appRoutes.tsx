import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { ROUTES } from '@/shared/constants/routes';
import { ErrorBoundary } from '@/shared/components/feedback';
import { ServiceDetailPageView } from '@/domains/services';
import { SettingsPageView } from '@/domains/settings';
import { TraceDetailPageView } from '@/domains/traces';

import MainLayout from '../layout/MainLayout';
import BackendDrivenPage from './BackendDrivenPage';
import ProtectedRoute from './ProtectedRoute';

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
      <Route path={ROUTES.login} element={<LoginPage />} />

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
              <SettingsPageView />
            </ErrorBoundary>
          )}
        />
        <Route
          path={toNestedRoutePath(ROUTES.traceDetail)}
          element={(
            <ErrorBoundary>
              <TraceDetailPageView />
            </ErrorBoundary>
          )}
        />
        <Route
          path={toNestedRoutePath(ROUTES.serviceDetail)}
          element={(
            <ErrorBoundary>
              <ServiceDetailPageView />
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
