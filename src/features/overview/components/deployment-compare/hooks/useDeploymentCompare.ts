import { useMemo } from "react";

import { deploymentsApi } from "@/features/overview/api/deploymentsApi";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";
import { useRefreshKey, useTeamId } from "@app/store/appStore";

import type { DeploymentSeed } from "../types";
import { buildTimelineSeries, parseDeploymentSeed } from "../utils";

export function useDeploymentCompare(initialData: Record<string, unknown> | null | undefined) {
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();

  const seed: DeploymentSeed | null = useMemo(
    () => parseDeploymentSeed(initialData),
    [initialData]
  );

  const compareQuery = useStandardQuery({
    queryKey: [
      "deployment-compare",
      teamId,
      refreshKey,
      seed?.serviceName,
      seed?.version,
      seed?.environment,
      seed?.deployedAtMs,
    ],
    queryFn: async () =>
      deploymentsApi.getDeploymentCompare({
        serviceName: seed?.serviceName ?? "",
        version: seed?.version ?? "",
        environment: seed?.environment ?? "",
        deployedAt: seed?.deployedAtMs ?? 0,
      }),
    enabled: Boolean(teamId && seed?.serviceName && seed?.version && seed?.deployedAtMs),
  });

  const compare = compareQuery.data;

  const timelineQuery = useStandardQuery({
    queryKey: [
      "deployment-compare-timeline",
      teamId,
      refreshKey,
      compare?.deployment.service_name,
      compare?.timeline_start_ms,
      compare?.timeline_end_ms,
    ],
    queryFn: async () =>
      deploymentsApi.getVersionTraffic(
        compare?.deployment.service_name ?? "",
        compare?.timeline_start_ms ?? 0,
        compare?.timeline_end_ms ?? 0
      ),
    enabled: Boolean(
      teamId &&
        compare?.deployment.service_name &&
        (compare?.timeline_start_ms ?? 0) < (compare?.timeline_end_ms ?? 0)
    ),
  });

  const timeline = useMemo(
    () => (compare && timelineQuery.data ? buildTimelineSeries(compare, timelineQuery.data) : null),
    [compare, timelineQuery.data]
  );

  return {
    seed,
    compare,
    compareQuery,
    timelineQuery,
    timeline,
  };
}
