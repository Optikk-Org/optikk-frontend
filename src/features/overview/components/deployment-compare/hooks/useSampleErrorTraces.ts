import { useStandardQuery } from "@shared/hooks/useStandardQuery";
import { useRefreshKey, useTeamId } from "@app/store/appStore";
import { tracesApi } from "@/features/traces/api/tracesApi";
import type { TracesResponse } from "@entities/trace/model";

export function useSampleErrorTraces(
  serviceName: string | undefined,
  startMs: number,
  endMs: number,
  limit = 10
) {
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();
  const enabled = Boolean(teamId && serviceName && startMs > 0 && endMs > startMs);

  const query = useStandardQuery<TracesResponse>({
    queryKey: [
      "deployment-compare-sample-traces",
      teamId,
      refreshKey,
      serviceName,
      startMs,
      endMs,
      limit,
    ],
    queryFn: () =>
      tracesApi.getTraces(teamId, startMs, endMs, {
        services: [serviceName ?? ""],
        status: "ERROR",
        limit,
        offset: 0,
      }),
    enabled,
  });

  return {
    traces: query.data?.traces ?? [],
    loading: query.isLoading,
  };
}
