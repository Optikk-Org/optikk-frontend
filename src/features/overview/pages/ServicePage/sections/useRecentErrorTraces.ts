import { tracesApi } from "@/features/traces/api/tracesApi";
import type { TraceRecord } from "@entities/trace/model";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

export function useRecentErrorTraces(serviceName: string, limit = 10): {
  traces: readonly TraceRecord[];
  loading: boolean;
} {
  const enabled = Boolean(serviceName);
  const query = useTimeRangeQuery(
    "service-page-recent-error-traces",
    (teamId, startTime, endTime) =>
      tracesApi.getTraces(teamId, startTime, endTime, {
        services: [serviceName],
        status: "ERROR",
        limit,
        offset: 0,
      }),
    { extraKeys: [serviceName, limit], enabled }
  );

  return {
    traces: query.data?.traces ?? [],
    loading: query.isLoading && (query.data?.traces ?? []).length === 0,
  };
}
