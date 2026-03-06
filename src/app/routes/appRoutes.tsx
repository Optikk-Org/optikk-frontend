import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import ErrorBoundary from '@components/common/feedback/ErrorBoundary';
import MainLayout from '@components/layout/MainLayout';

import { ROUTES } from '@/shared/constants/routes';

import { domainRegistry } from '../registry/domainRegistry';
import ProtectedRoute from './ProtectedRoute';

const LoginPage = lazy(() => import('@features/auth'));

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
        {domainRegistry.flatMap((domain) =>
          domain.routes.map((route) => {
            const Page = route.page;
            return (
              <Route
                key={`${domain.key}:${route.path}`}
                path={toNestedRoutePath(route.path)}
                element={
                  <ErrorBoundary>
                    <Page />
                  </ErrorBoundary>
                }
              />
            );
          }),
        )}
        <Route
          path={toNestedRoutePath(ROUTES.latencyAlias)}
          element={<Navigate to={`${ROUTES.metrics}?tab=latency`} replace />}
        />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  );
}
