import { useMemo } from "react";

import {
  deploymentsApi,
  type DeploymentVersionTrafficPoint,
  type ServiceLatestDeployment,
} from "@/features/overview/api/deploymentsApi";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

export interface VersionSeries {
  readonly label: string;
  readonly values: Array<number | null>;
}

export interface DeploymentsTimeline {
  readonly timestamps: number[];
  readonly series: VersionSeries[];
}

function toSeconds(iso: string): number {
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : 0;
}

function buildTimeline(points: readonly DeploymentVersionTrafficPoint[]): DeploymentsTimeline {
  const timestamps = Array.from(
    new Set(points.map((point) => toSeconds(point.timestamp)).filter((ts) => ts > 0))
  ).sort((left, right) => left - right);

  const versionMap = new Map<string, Map<number, number>>();
  for (const point of points) {
    const ts = toSeconds(point.timestamp);
    if (!ts) continue;
    const bucket = versionMap.get(point.version) ?? new Map<number, number>();
    bucket.set(ts, point.rps);
    versionMap.set(point.version, bucket);
  }

  const versions = Array.from(versionMap.keys()).sort();
  const series = versions.map((version) => ({
    label: version,
    values: timestamps.map((ts) => versionMap.get(version)?.get(ts) ?? null),
  }));

  return { timestamps, series };
}

export function useServiceDeployments(serviceName: string): {
  latestByService: ServiceLatestDeployment | null;
  timeline: DeploymentsTimeline;
  loading: boolean;
} {
  const enabled = Boolean(serviceName);

  const latestQuery = useTimeRangeQuery(
    "service-page-latest-deployment",
    async () => deploymentsApi.getLatestByService(),
    { enabled }
  );

  const timelineQuery = useTimeRangeQuery(
    "service-page-version-traffic",
    (_teamId, start, end) => deploymentsApi.getVersionTraffic(serviceName, start, end),
    { extraKeys: [serviceName], enabled }
  );

  const latest = useMemo(
    () => (latestQuery.data ?? []).find((row) => row.service_name === serviceName) ?? null,
    [latestQuery.data, serviceName]
  );
  const timeline = useMemo(() => buildTimeline(timelineQuery.data ?? []), [timelineQuery.data]);

  return {
    latestByService: latest,
    timeline,
    loading: latestQuery.isLoading || timelineQuery.isLoading,
  };
}
