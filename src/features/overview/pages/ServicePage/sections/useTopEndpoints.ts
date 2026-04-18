import { useMemo } from "react";

import { metricsOverviewApi } from "@/features/metrics/api/metricsOverviewApi";
import type { EndpointMetricPoint } from "@/features/metrics/types";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

function sortByRequests(rows: readonly EndpointMetricPoint[]): EndpointMetricPoint[] {
  return [...rows].sort(
    (left, right) => Number(right.request_count ?? 0) - Number(left.request_count ?? 0)
  );
}

export function useTopEndpoints(serviceName: string, limit = 10): {
  endpoints: readonly EndpointMetricPoint[];
  loading: boolean;
} {
  const enabled = Boolean(serviceName);
  const query = useTimeRangeQuery(
    "service-page-endpoints",
    (teamId, start, end) =>
      metricsOverviewApi.getOverviewEndpointMetrics(teamId, start, end, serviceName),
    { extraKeys: [serviceName], enabled }
  );

  const endpoints = useMemo(
    () => sortByRequests(query.data ?? []).slice(0, limit),
    [query.data, limit]
  );

  return { endpoints, loading: query.isLoading && endpoints.length === 0 };
}
