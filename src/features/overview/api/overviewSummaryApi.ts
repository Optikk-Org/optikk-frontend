import type { RequestTime } from "@shared/api/service-types";

import type { ServiceMetricPoint } from "@/features/metrics/types";

/**
 * **Phase 0 stop-the-bleed stubs.**
 *
 * `/overview/summary`, `/overview/batch-summary`, and `/overview/chart-metrics`
 * never existed on the backend. Calls were 404'ing in production. These stubs
 * return empty objects/arrays synchronously so the OverviewHubPage Summary tab
 * renders empty cards instead of red errors.
 *
 * Phase 1.x rewires the Summary tab to fan out canonical RED + errors + APM
 * endpoints from the existing red/errors/apm modules. Once that ships, this
 * file can be deleted entirely.
 */

export interface OverviewGlobalSummary {
  total_requests?: number;
  error_count?: number;
  avg_latency?: number;
  p50_latency?: number;
  p95_latency?: number;
  p99_latency?: number;
}

export interface OverviewBatchSummary {
  summary: OverviewGlobalSummary;
  services: ServiceMetricPoint[];
}

export interface ChartMetricsPoint {
  timestamp: string;
  service_name?: string;
  request_count: number;
  error_count: number;
  error_rate: number;
  p95: number;
}

const EMPTY_SUMMARY: OverviewGlobalSummary = Object.freeze({});

export async function getOverviewSummary(
  _startTime: RequestTime,
  _endTime: RequestTime
): Promise<OverviewGlobalSummary> {
  return EMPTY_SUMMARY;
}

export async function getBatchSummary(
  _startTime: RequestTime,
  _endTime: RequestTime
): Promise<OverviewBatchSummary> {
  return { summary: EMPTY_SUMMARY, services: [] };
}

export async function getChartMetrics(
  _startTime: RequestTime,
  _endTime: RequestTime
): Promise<ChartMetricsPoint[]> {
  return [];
}
