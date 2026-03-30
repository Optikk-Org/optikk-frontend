import { useEffect, useMemo, useRef } from 'react';

import { queryClient } from '@shared/api/queryClient';

import { useAppStore } from '@store/appStore';
import { useAuthStore } from '@store/authStore';

import type { ReactNode } from 'react';

interface QueryLifecycleBridgeProps {
  readonly children: ReactNode;
}

export default function QueryLifecycleBridge({ children }: QueryLifecycleBridgeProps): JSX.Element {
  const teamScope = useAppStore((state) => ({
    selectedTeamId: state.selectedTeamId,
    selectedTeamIds: state.selectedTeamIds,
  }));
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const teamScopeKey = useMemo(() => JSON.stringify(teamScope), [teamScope]);
  const isFirstTeamScope = useRef(true);
  const previousAuthState = useRef(isAuthenticated);

  useEffect(() => {
    if (isFirstTeamScope.current) {
      isFirstTeamScope.current = false;
      return;
    }

    void queryClient.invalidateQueries();
  }, [teamScopeKey]);

  useEffect(() => {
    if (previousAuthState.current && !isAuthenticated) {
      queryClient.clear();
    }

    previousAuthState.current = isAuthenticated;
  }, [isAuthenticated]);

  return <>{children}</>;
}
