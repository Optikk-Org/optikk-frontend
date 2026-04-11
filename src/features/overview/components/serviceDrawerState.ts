import { ROUTES } from "@/shared/constants/routes";
import {
  DASHBOARD_DRAWER_PARAMS,
  buildDashboardDrawerSearch,
  buildLegacyDashboardDrawerSearch,
} from "@shared/components/ui/dashboard/utils/dashboardDrawerState";

/** Serialized into `drawerData` for ServiceDetailDrawer (matches discovery API snake_case). */
export interface ServiceDrawerKubernetesSeed {
  readonly podRestarts: number;
  readonly replicaDesired: number;
  readonly replicaAvailable: number;
  readonly rolloutStatus: string;
  readonly namespace?: string;
  readonly primaryContainerImageTag?: string;
  readonly restartHotPodName?: string;
  readonly restartHotImageTag?: string;
}

export interface ServiceDrawerSeedData {
  readonly name: string;
  readonly requestCount?: number;
  readonly errorCount?: number;
  readonly errorRate?: number;
  readonly avgLatency?: number;
  readonly p95Latency?: number;
  readonly p99Latency?: number;
  readonly kubernetes?: ServiceDrawerKubernetesSeed;
  /** Release version from span-based deployment correlation (not the container image tag). */
  readonly telemetryVersion?: string;
}

export interface DeploymentDrawerSeedData {
  readonly serviceName: string;
  readonly version: string;
  readonly environment: string;
  readonly deployedAt: string;
  readonly lastSeenAt?: string;
  readonly isActive?: boolean;
  readonly kubernetes?: ServiceDrawerKubernetesSeed;
}

/** Kubernetes slice parsed from `drawerData` (snake_case), shared by deployment and service drawers. */
export interface KubernetesInfraFromDrawer {
  readonly podRestarts: number;
  readonly replicaDesired: number;
  readonly replicaAvailable: number;
  readonly rolloutStatus: string;
  readonly namespace?: string;
  readonly primaryContainerImageTag?: string;
  readonly restartHotPodName?: string;
  readonly restartHotImageTag?: string;
}

function readDrawerNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function readDrawerOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const t = value.trim();
  return t !== "" ? t : undefined;
}

export function parseKubernetesInfraFromDrawerData(
  data: Record<string, unknown> | null | undefined
): KubernetesInfraFromDrawer | null {
  if (!data) {
    return null;
  }
  const raw = data.kubernetes;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const o = raw as Record<string, unknown>;
  return {
    podRestarts: readDrawerNumber(o.pod_restarts) ?? readDrawerNumber(o.pod_restarts_max) ?? 0,
    replicaDesired: readDrawerNumber(o.replica_desired) ?? 0,
    replicaAvailable: readDrawerNumber(o.replica_available) ?? 0,
    rolloutStatus: typeof o.rollout_status === "string" ? o.rollout_status : "unknown",
    namespace: readDrawerOptionalString(o.namespace),
    primaryContainerImageTag: readDrawerOptionalString(o.primary_container_image_tag),
    restartHotPodName: readDrawerOptionalString(o.restart_hot_pod_name),
    restartHotImageTag: readDrawerOptionalString(o.restart_hot_image_tag),
  };
}

export function buildServiceDrawerSearch(
  currentSearch: string,
  service: string | ServiceDrawerSeedData
): string {
  const serviceName = typeof service === "string" ? service : service.name;
  const row =
    typeof service === "string"
      ? { service_name: serviceName }
      : {
          service_name: service.name,
          request_count: service.requestCount,
          error_count: service.errorCount,
          error_rate: service.errorRate,
          avg_latency: service.avgLatency,
          p95_latency: service.p95Latency,
          p99_latency: service.p99Latency,
          ...(service.kubernetes
            ? {
                kubernetes: {
                  pod_restarts: service.kubernetes.podRestarts,
                  replica_desired: service.kubernetes.replicaDesired,
                  replica_available: service.kubernetes.replicaAvailable,
                  rollout_status: service.kubernetes.rolloutStatus,
                  ...(service.kubernetes.namespace
                    ? { namespace: service.kubernetes.namespace }
                    : {}),
                  ...(service.kubernetes.primaryContainerImageTag
                    ? { primary_container_image_tag: service.kubernetes.primaryContainerImageTag }
                    : {}),
                  ...(service.kubernetes.restartHotPodName
                    ? { restart_hot_pod_name: service.kubernetes.restartHotPodName }
                    : {}),
                  ...(service.kubernetes.restartHotImageTag
                    ? { restart_hot_image_tag: service.kubernetes.restartHotImageTag }
                    : {}),
                },
              }
            : {}),
          ...(service.telemetryVersion ? { telemetry_version: service.telemetryVersion } : {}),
        };

  return (
    buildDashboardDrawerSearch(
      currentSearch,
      { entity: "service", idField: "service_name", titleField: "service_name" },
      row
    ) ?? buildLegacyDashboardDrawerSearch(currentSearch, "service", serviceName, serviceName)
  );
}

export function buildDeploymentCompareDrawerSearch(
  currentSearch: string,
  deployment: DeploymentDrawerSeedData
): string {
  const row = {
    deployment_key: `${deployment.serviceName}::${deployment.version}::${deployment.environment}::${deployment.deployedAt}`,
    service_name: deployment.serviceName,
    version: deployment.version,
    environment: deployment.environment,
    deployed_at: deployment.deployedAt,
    last_seen_at: deployment.lastSeenAt,
    is_active: deployment.isActive ?? false,
    ...(deployment.kubernetes
      ? {
          kubernetes: {
            pod_restarts: deployment.kubernetes.podRestarts,
            replica_desired: deployment.kubernetes.replicaDesired,
            replica_available: deployment.kubernetes.replicaAvailable,
            rollout_status: deployment.kubernetes.rolloutStatus,
            ...(deployment.kubernetes.namespace ? { namespace: deployment.kubernetes.namespace } : {}),
            ...(deployment.kubernetes.primaryContainerImageTag
              ? { primary_container_image_tag: deployment.kubernetes.primaryContainerImageTag }
              : {}),
            ...(deployment.kubernetes.restartHotPodName
              ? { restart_hot_pod_name: deployment.kubernetes.restartHotPodName }
              : {}),
            ...(deployment.kubernetes.restartHotImageTag
              ? { restart_hot_image_tag: deployment.kubernetes.restartHotImageTag }
              : {}),
          },
        }
      : {}),
  };

  return (
    buildDashboardDrawerSearch(
      currentSearch,
      { entity: "deployment", idField: "deployment_key", titleField: "service_name" },
      row
    ) ??
    buildLegacyDashboardDrawerSearch(
      currentSearch,
      "deployment",
      row.deployment_key,
      deployment.serviceName
    )
  );
}

function searchParamsToObject(searchParams: URLSearchParams): Record<string, string | string[]> {
  const search: Record<string, string | string[]> = {};

  for (const [key, value] of searchParams.entries()) {
    const currentValue = search[key];
    if (currentValue === undefined) {
      search[key] = value;
      continue;
    }

    if (Array.isArray(currentValue)) {
      currentValue.push(value);
      continue;
    }

    search[key] = [currentValue, value];
  }

  return search;
}

function clearServiceDrawerParams(searchParams: URLSearchParams): void {
  searchParams.delete(DASHBOARD_DRAWER_PARAMS.entity);
  searchParams.delete(DASHBOARD_DRAWER_PARAMS.id);
  searchParams.delete(DASHBOARD_DRAWER_PARAMS.title);
  searchParams.delete(DASHBOARD_DRAWER_PARAMS.data);
}

export function buildServiceTracesSearch(
  currentSearch: string,
  serviceName: string
): Record<string, string | string[]> {
  const next = new URLSearchParams(currentSearch);
  clearServiceDrawerParams(next);
  next.delete("view");
  next.delete("topologyFocus");
  next.delete("filters");
  next.delete("serviceName");
  next.set("service", serviceName);
  return searchParamsToObject(next);
}

export function buildServiceLogsSearch(
  currentSearch: string,
  serviceName: string
): Record<string, string | string[]> {
  const next = new URLSearchParams(currentSearch);
  clearServiceDrawerParams(next);
  next.delete("view");
  next.delete("topologyFocus");
  next.delete("service");
  next.delete("serviceName");
  next.set("filters", `service_name:equals:${encodeURIComponent(serviceName)}`);
  return searchParamsToObject(next);
}

export function buildLegacyServicePagePath(serviceName: string): string {
  return `${ROUTES.service}?serviceName=${encodeURIComponent(serviceName)}`;
}
