import { useMemo } from "react";

import {
  serviceDetailApi,
  type Http5xxRoutePoint,
} from "@/features/overview/api/serviceDetailApi";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

function sortRoutes(rows: readonly Http5xxRoutePoint[]): Http5xxRoutePoint[] {
  return [...rows].sort((left, right) => Number(right.count ?? 0) - Number(left.count ?? 0));
}

export function useHttp5xxByRoute(serviceName: string, limit = 8): {
  routes: readonly Http5xxRoutePoint[];
  loading: boolean;
} {
  const enabled = Boolean(serviceName);
  const query = useTimeRangeQuery(
    "service-page-http-5xx",
    (_teamId, start, end) => serviceDetailApi.getHttp5xxByRoute(start, end, serviceName),
    { extraKeys: [serviceName], enabled }
  );

  const routes = useMemo(
    () => sortRoutes(query.data ?? []).slice(0, limit),
    [query.data, limit]
  );

  return { routes, loading: query.isLoading && routes.length === 0 };
}
