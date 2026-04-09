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

const versionTrafficPointSchema = z
  .object({
    timestamp: stringValue,
    version: stringValue,
    rps: numericValue,
  })
  .strict();

const compareWindowSchema = z
  .object({
    start_ms: numericValue,
    end_ms: numericValue,
  })
  .strict();

const impactMetricsSchema = z
  .object({
    request_count: numericValue,
    error_count: numericValue,
    error_rate: numericValue,
    p95_ms: numericValue,
    p99_ms: numericValue,
    rps: numericValue,
  })
  .strict();

const compareErrorRegressionSchema = z
  .object({
    group_id: stringValue,
    operation_name: stringValue,
    status_message: stringValue,
    http_status_code: numericValue,
    before_count: numericValue,
    after_count: numericValue,
    delta_count: numericValue,
    last_occurrence: stringValue,
    sample_trace_id: stringValue,
    severity: stringValue,
  })
  .strict();

const compareEndpointRegressionSchema = z
  .object({
    endpoint_name: stringValue,
    operation_name: stringValue,
    http_method: stringValue,
    before_requests: numericValue,
    after_requests: numericValue,
    request_delta: numericValue,
    before_error_rate: numericValue,
    after_error_rate: numericValue,
    error_rate_delta: numericValue,
    before_p95_ms: numericValue,
    after_p95_ms: numericValue,
    p95_delta_ms: numericValue,
    before_p99_ms: numericValue,
    after_p99_ms: numericValue,
    p99_delta_ms: numericValue,
    regression_score: numericValue,
  })
  .strict();

const deploymentCompareSchema = z
  .object({
    deployment: latestDeploymentSchema,
    before_window: compareWindowSchema.optional(),
    after_window: compareWindowSchema,
    has_baseline: booleanValue,
    summary: z
      .object({
        before: impactMetricsSchema.optional(),
        after: impactMetricsSchema,
      })
      .strict(),
    top_errors: z.array(compareErrorRegressionSchema).default([]),
    top_endpoints: z.array(compareEndpointRegressionSchema).default([]),
    timeline_start_ms: numericValue,
    timeline_end_ms: numericValue,
  })
  .strict();

export type ServiceLatestDeployment = z.infer<typeof latestDeploymentSchema>;
export type DeploymentVersionTrafficPoint = z.infer<typeof versionTrafficPointSchema>;
export type DeploymentCompareWindow = z.infer<typeof compareWindowSchema>;
export type DeploymentImpactMetrics = z.infer<typeof impactMetricsSchema>;
export type DeploymentCompareErrorRegression = z.infer<typeof compareErrorRegressionSchema>;
export type DeploymentCompareEndpointRegression = z.infer<typeof compareEndpointRegressionSchema>;
export type DeploymentCompareResponse = z.infer<typeof deploymentCompareSchema>;

export const deploymentsApi = {
  async getLatestByService(): Promise<ServiceLatestDeployment[]> {
    const data = await api.get(`${BASE}/deployments/latest-by-service`);
    return validateResponse(z.array(latestDeploymentSchema), data);
  },

  async getVersionTraffic(
    serviceName: string,
    startTime: RequestTime,
    endTime: RequestTime
  ): Promise<DeploymentVersionTrafficPoint[]> {
    const data = await api.get(`${BASE}/deployments/timeline`, {
      params: { serviceName, startTime, endTime },
    });
    return validateResponse(z.array(versionTrafficPointSchema), data);
  },

  async getDeploymentCompare(params: {
    serviceName: string;
    version: string;
    environment: string;
    deployedAt: number;
  }): Promise<DeploymentCompareResponse> {
    const data = await api.get(`${BASE}/deployments/compare`, { params });
    return validateResponse(deploymentCompareSchema, data);
  },
};
