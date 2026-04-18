import { useCallback, useEffect, useState } from "react";

import { useTeamId } from "@app/store/appStore";

function storageKey(teamId: number | null): string {
  return `service-rail:${teamId ?? "anon"}`;
}

function readCollapsed(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function writeCollapsed(key: string, value: boolean): void {
  try {
    window.localStorage.setItem(key, value ? "true" : "false");
  } catch {
    /* ignore quota/disabled storage */
  }
}

export function useRailCollapsed(): {
  collapsed: boolean;
  toggle: () => void;
} {
  const teamId = useTeamId();
  const key = storageKey(teamId);
  const [collapsed, setCollapsed] = useState<boolean>(() => readCollapsed(key));

  useEffect(() => {
    setCollapsed(readCollapsed(key));
  }, [key]);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      writeCollapsed(key, next);
      return next;
    });
  }, [key]);

  return { collapsed, toggle };
}
