import { useMemo } from "react";

import {
  getServiceTopology,
  type ServiceTopologyEdge,
} from "@/features/overview/pages/ServiceHubPage/topology/api";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

export interface DependencyRow {
  readonly peerService: string;
  readonly callCount: number;
  readonly errorRate: number;
  readonly p95: number;
}

function toRow(edge: ServiceTopologyEdge, peer: string): DependencyRow {
  return {
    peerService: peer,
    callCount: edge.call_count,
    errorRate: edge.error_rate,
    p95: edge.p95_latency_ms,
  };
}

function upstreamRows(
  edges: readonly ServiceTopologyEdge[],
  serviceName: string
): DependencyRow[] {
  return edges.filter((edge) => edge.target === serviceName).map((edge) => toRow(edge, edge.source));
}

function downstreamRows(
  edges: readonly ServiceTopologyEdge[],
  serviceName: string
): DependencyRow[] {
  return edges.filter((edge) => edge.source === serviceName).map((edge) => toRow(edge, edge.target));
}

export function useServiceDependencies(serviceName: string): {
  upstream: DependencyRow[];
  downstream: DependencyRow[];
  loading: boolean;
} {
  const enabled = Boolean(serviceName);
  const query = useTimeRangeQuery(
    "service-page-dependencies",
    async (_teamId, startTime, endTime) =>
      getServiceTopology({ startTime, endTime, service: serviceName }),
    { extraKeys: [serviceName], enabled }
  );

  const edges = query.data?.edges ?? [];
  const upstream = useMemo(() => upstreamRows(edges, serviceName), [edges, serviceName]);
  const downstream = useMemo(() => downstreamRows(edges, serviceName), [edges, serviceName]);

  return {
    upstream,
    downstream,
    loading: query.isLoading && edges.length === 0,
  };
}
