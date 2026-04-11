import type { ServiceLatestDeployment } from "@/features/overview/api/deploymentsApi";
import {
  type ServiceDiscoveryMergedRow,
  serviceDiscoveryApi,
} from "@/features/overview/api/serviceDiscoveryApi";
import type { RequestTime } from "@/shared/api/service-types";

export type DiscoveryHealth = "healthy" | "degraded" | "unhealthy";
export type DeploymentRisk = "stable" | "watch" | "critical" | "unknown";
export type KubernetesRolloutStatus = "healthy" | "degraded" | "unknown";

export interface DiscoveryKubernetesSlot {
  readonly namespace?: string;
  /** Highest container restart count on any pod mapped to this workload. */
  readonly podRestarts: number;
  readonly replicaDesired: number;
  readonly replicaAvailable: number;
  readonly rolloutStatus: KubernetesRolloutStatus;
  /** Most common `container.image.tag` among pods (when present on metrics). */
  readonly primaryContainerImageTag?: string;
  readonly restartHotPodName?: string;
  readonly restartHotImageTag?: string;
}

export interface DiscoveryServiceRow {
  readonly name: string;
  readonly sources: readonly string[];
  readonly requestCount: number;
  readonly errorCount: number;
  readonly errorRate: number;
  readonly avgLatency: number;
  readonly p50Latency: number;
  readonly p95Latency: number;
  readonly p99Latency: number;
  readonly upstreamCount: number;
  readonly downstreamCount: number;
  readonly health: DiscoveryHealth;
  readonly latestDeployment?: ServiceLatestDeployment;
  readonly deploymentRisk: DeploymentRisk;
  readonly kubernetes?: DiscoveryKubernetesSlot;
}

export interface DiscoveryFetchResult {
  readonly rows: DiscoveryServiceRow[];
  readonly kubernetesDataAvailable: boolean;
}

function mapLatestDeployment(
  raw: NonNullable<ServiceDiscoveryMergedRow["latest_deployment"]>
): ServiceLatestDeployment {
  return {
    service_name: raw.service_name,
    version: raw.version,
    environment: raw.environment,
    deployed_at: raw.deployed_at,
    last_seen_at: raw.last_seen_at,
    is_active: raw.is_active,
  };
}

function mapMergedRow(row: ServiceDiscoveryMergedRow): DiscoveryServiceRow {
  const apm = row.apm ?? undefined;
  const k8s = row.kubernetes ?? undefined;

  return {
    name: row.name,
    sources: row.sources,
    requestCount: apm?.request_count ?? 0,
    errorCount: apm?.error_count ?? 0,
    errorRate: apm?.error_rate ?? 0,
    avgLatency: apm?.avg_latency ?? 0,
    p50Latency: apm?.p50_latency ?? 0,
    p95Latency: apm?.p95_latency ?? 0,
    p99Latency: apm?.p99_latency ?? 0,
    upstreamCount: row.topology_upstream,
    downstreamCount: row.topology_downstream,
    health: row.health,
    deploymentRisk: row.deployment_risk,
    latestDeployment: row.latest_deployment
      ? mapLatestDeployment(row.latest_deployment)
      : undefined,
    kubernetes: k8s
      ? {
          namespace: k8s.namespace,
          podRestarts: k8s.pod_restarts,
          replicaDesired: k8s.replica_desired,
          replicaAvailable: k8s.replica_available,
          rolloutStatus: k8s.rollout_status,
          primaryContainerImageTag: k8s.primary_container_image_tag,
          restartHotPodName: k8s.restart_hot_pod_name,
          restartHotImageTag: k8s.restart_hot_image_tag,
        }
      : undefined,
  };
}

export async function fetchDiscoveryRows(
  _teamId: number | null,
  startTime: RequestTime,
  endTime: RequestTime
): Promise<DiscoveryFetchResult> {
  const payload = await serviceDiscoveryApi.getDiscovery({ startTime, endTime });
  return {
    rows: payload.rows.map(mapMergedRow),
    kubernetesDataAvailable: payload.kubernetes_data_available,
  };
}
