import { useMemo } from "react";

import { serviceDetailApi } from "@/features/overview/api/serviceDetailApi";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

export interface ApdexSummary {
  readonly apdex: number | null;
  readonly satisfied: number;
  readonly tolerating: number;
  readonly frustrated: number;
  readonly isServiceScoped: boolean;
}

function pickServiceRow<T extends { service_name?: string }>(
  rows: readonly T[],
  serviceName: string
): { row: T | null; scoped: boolean } {
  const target = serviceName.trim().toLowerCase();
  const match = rows.find((row) => (row.service_name ?? "").toLowerCase() === target);
  if (match) return { row: match, scoped: true };
  return { row: rows[0] ?? null, scoped: false };
}

export function useApdex(serviceName: string): {
  summary: ApdexSummary | null;
  loading: boolean;
} {
  const enabled = Boolean(serviceName);
  const query = useTimeRangeQuery(
    "service-page-apdex",
    (_teamId, start, end) => serviceDetailApi.getApdex(start, end, serviceName),
    { extraKeys: [serviceName], enabled }
  );

  const summary = useMemo<ApdexSummary | null>(() => {
    const rows = query.data ?? [];
    if (rows.length === 0) return null;
    const { row, scoped } = pickServiceRow(rows, serviceName);
    if (!row) return null;
    return {
      apdex: row.apdex ?? null,
      satisfied: row.satisfied ?? 0,
      tolerating: row.tolerating ?? 0,
      frustrated: row.frustrated ?? 0,
      isServiceScoped: scoped,
    };
  }, [query.data, serviceName]);

  return { summary, loading: query.isLoading && !summary };
}
