import { Skeleton } from 'antd';
import { useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { authService } from '@shared/api/auth/authService';
import { clearAuthPresentFlag } from '@shared/api/auth/authStorage';

import { useAppStore } from '@store/appStore';
import { useAuthStore } from '@store/authStore';

import { APP_COLORS } from '@config/colorLiterals';

import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  readonly children: ReactNode;
}

/**
 * Renders children when authenticated + a team is selected.
 *
 * Edge-case handled: if the auth flag is set but `selectedTeamId` is missing
 * (e.g. clearAuthStorage ran, but the auth:expired event was dropped), we
 * probe the backend once. A failed probe redirects to /login.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const selectedTeamId = useAppStore((state) => state.selectedTeamId);
  const probeStarted = useRef(false);

  // When auth flag is set but teamId is gone, probe the backend once.
  useEffect(() => {
    if (!isAuthenticated || selectedTeamId !== null || probeStarted.current) {
      return;
    }

    probeStarted.current = true;

    void (async () => {
      const valid = await authService.validateSession();
      if (!valid) {
        clearAuthPresentFlag();
        useAuthStore.setState({ isAuthenticated: false, user: null });
        navigate('/login', { replace: true });
      }
      // If valid, the backend will eventually supply team info (or the user
      // will need to select one). Don't redirect — show the skeleton a bit
      // longer so team-selection flow can complete.
    })();
  }, [isAuthenticated, selectedTeamId, navigate]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!selectedTeamId) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: `var(--bg-primary, ${APP_COLORS.hex_0a0a0a_2})`,
        }}
      >
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return <>{children}</>;
}
