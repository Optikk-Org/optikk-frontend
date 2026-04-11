import { useEffect, useMemo, useRef } from "react";

import { queryClient } from "@shared/api/queryClient";

import { useAppStore } from "@store/appStore";
import { useAuthStore } from "@store/authStore";

import type { ReactNode } from "react";

interface QueryLifecycleBridgeProps {
  readonly children: ReactNode;
}

function queryKeyIncludesTeamId(key: unknown, teamId: number): boolean {
  if (!Array.isArray(key)) return false;
  return key.some((part) => part === teamId);
}

export default function QueryLifecycleBridge({ children }: QueryLifecycleBridgeProps): JSX.Element {
  const selectedTeamId = useAppStore((state) => state.selectedTeamId);
  const selectedTeamIds = useAppStore((state) => state.selectedTeamIds);
  const refreshKey = useAppStore((state) => state.refreshKey);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const teamScopeKey = useMemo(
    () => JSON.stringify({ selectedTeamId, selectedTeamIds }),
    [selectedTeamId, selectedTeamIds]
  );

  const isFirstTeamScope = useRef(true);
  const previousAuthState = useRef(isAuthenticated);
  const previousRefreshKey = useRef<number | null>(null);

  useEffect(() => {
    if (isFirstTeamScope.current) {
      isFirstTeamScope.current = false;
      return;
    }

    void queryClient.invalidateQueries();
  }, [teamScopeKey]);

  /** Manual / auto refresh: refetch in place so UI keeps showing previous data (no full blink). */
  useEffect(() => {
    if (previousRefreshKey.current === null) {
      previousRefreshKey.current = refreshKey;
      return;
    }
    if (previousRefreshKey.current === refreshKey) {
      return;
    }
    previousRefreshKey.current = refreshKey;
    if (selectedTeamId == null) {
      return;
    }
    void queryClient.invalidateQueries({
      predicate: (q) => queryKeyIncludesTeamId(q.queryKey, selectedTeamId),
    });
  }, [refreshKey, selectedTeamId]);

  useEffect(() => {
    if (previousAuthState.current && !isAuthenticated) {
      queryClient.clear();
    }

    previousAuthState.current = isAuthenticated;
  }, [isAuthenticated]);

  return <>{children}</>;
}
