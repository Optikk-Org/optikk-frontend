import { useMemo } from "react";

import {
  serviceDetailApi,
  type LatencyDuringErrorPoint,
} from "@/features/overview/api/serviceDetailApi";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

interface LatencyComparisonPoint {
  readonly timestamp: number;
  readonly inError: number | null;
  readonly inNormal: number | null;
}

function toSeconds(iso: string | undefined): number {
  if (!iso) return 0;
  const ms = new Date(iso).getTime();
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : 0;
}

function normalize(rows: readonly LatencyDuringErrorPoint[]): LatencyComparisonPoint[] {
  return rows
    .map((row) => ({
      timestamp: toSeconds(row.timestamp),
      inError: row.p95_latency_in_error_window ?? null,
      inNormal: row.p95_latency_in_normal_window ?? null,
    }))
    .filter((point) => point.timestamp > 0)
    .sort((left, right) => left.timestamp - right.timestamp);
}

export function useLatencyDuringErrors(serviceName: string): {
  points: LatencyComparisonPoint[];
  loading: boolean;
} {
  const enabled = Boolean(serviceName);
  const query = useTimeRangeQuery(
    "service-page-latency-during-errors",
    (_teamId, start, end) =>
      serviceDetailApi.getLatencyDuringErrorWindows(start, end, serviceName),
    { extraKeys: [serviceName], enabled }
  );

  const points = useMemo(() => normalize(query.data ?? []), [query.data]);
  return { points, loading: query.isLoading && points.length === 0 };
}
