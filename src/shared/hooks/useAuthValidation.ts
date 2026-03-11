import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { authService } from '@shared/api/auth/authService';
import { clearAuthPresentFlag, isAuthPresent } from '@shared/api/auth/authStorage';

import { useAuthStore } from '@store/authStore';
import { useAppStore } from '@store/appStore';

export type AuthValidationState = 'pending' | 'valid' | 'invalid';

/**
 * Validates the current auth session on mount.
 *
 * On first render, if the auth-present flag is set, this hook fires a
 * lightweight probe to GET /auth/me. If the server rejects the token (401),
 * it clears all auth state and returns 'invalid' so the caller can redirect
 * to /login. Returns 'pending' while the probe is in-flight.
 *
 * If the auth-present flag is absent, returns 'invalid' immediately (no probe).
 */
export function useAuthValidation(): AuthValidationState {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // If there is no auth flag we know immediately we're not authenticated.
  const [state, setState] = useState<AuthValidationState>(() => {
    if (!isAuthPresent()) {
      return 'invalid';
    }
    return 'pending';
  });

  useEffect(() => {
    // Nothing to validate if there was no auth flag.
    if (!isAuthPresent()) {
      setState('invalid');
      return;
    }

    let cancelled = false;

    void (async () => {
      const valid = await authService.validateSession();
      if (cancelled) {
        return;
      }

      if (valid) {
        setState('valid');
      } else {
        // Clear everything the error interceptor may have missed.
        clearAuthPresentFlag();
        useAuthStore.setState({ isAuthenticated: false, user: null });
        useAppStore.setState({ selectedTeamId: null, selectedTeamIds: [] });
        setState('invalid');
        navigate('/login', { replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If the store says not authenticated and probe hasn't started, skip it.
  if (!isAuthenticated && state === 'pending') {
    return 'invalid';
  }

  return state;
}
