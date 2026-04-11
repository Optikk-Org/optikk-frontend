import { z } from "zod";

import api from "@/shared/api/api/client";
import type { RequestTime } from "@/shared/api/service-types";
import { validateResponse } from "@/shared/api/utils/validate";
import { API_CONFIG } from "@config/apiConfig";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const numericValue = z.coerce.number().default(0);
const stringValue = z.string().default("");
const booleanValue = z.coerce.boolean().default(false);

const latestDeploymentSchema = z
  .object({
    service_name: stringValue,
    version: stringValue,
    environment: stringValue,
    deployed_at: stringValue,
    last_seen_at: stringValue,
    is_active: booleanValue,
  })
  .strict();

const apmSlotSchema = z
  .object({
    request_count: numericValue,
    error_count: numericValue,
    error_rate: numericValue,
    avg_latency: numericValue,
    p50_latency: numericValue,
    p95_latency: numericValue,
    p99_latency: numericValue,
  })
  .strict();

const rolloutStatusSchema = z.enum(["healthy", "degraded", "unknown"]);

const kubernetesSlotSchema = z
  .object({
    namespace: z.string().optional(),
    pod_restarts: numericValue,
    replica_desired: numericValue,
    replica_available: numericValue,
    rollout_status: rolloutStatusSchema,
    primary_container_image_tag: z.string().optional(),
    restart_hot_pod_name: z.string().optional(),
    restart_hot_image_tag: z.string().optional(),
  })
  .strict();

const discoveryMergedRowSchema = z
  .object({
    name: stringValue,
    sources: z.array(z.string()).default([]),
    health: z.enum(["healthy", "degraded", "unhealthy"]),
    deployment_risk: z.enum(["stable", "watch", "critical", "unknown"]),
    apm: apmSlotSchema.optional().nullable(),
    topology_upstream: numericValue,
    topology_downstream: numericValue,
    latest_deployment: latestDeploymentSchema.optional().nullable(),
    kubernetes: kubernetesSlotSchema.optional().nullable(),
  })
  .strict();

const discoveryResponseSchema = z
  .object({
    rows: z.array(discoveryMergedRowSchema).default([]),
    kubernetes_data_available: booleanValue,
  })
  .strict();

export type ServiceDiscoveryMergedRow = z.infer<typeof discoveryMergedRowSchema>;
export type ServiceDiscoveryResponse = z.infer<typeof discoveryResponseSchema>;

export const serviceDiscoveryApi = {
  async getDiscovery(params: {
    startTime: RequestTime;
    endTime: RequestTime;
    node?: string;
  }): Promise<ServiceDiscoveryResponse> {
    const raw = await api.get<unknown>(`${BASE}/overview/services/discovery`, {
      params: {
        startTime: params.startTime,
        endTime: params.endTime,
        ...(params.node ? { node: params.node } : {}),
      },
    });
    return validateResponse(
      discoveryResponseSchema,
      raw ?? { rows: [], kubernetes_data_available: false }
    );
  },
};
