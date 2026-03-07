import type {
  DomainRecord,
  ServiceMetric,
  ServiceStatus,
  ServiceTimeSeriesPoint,
  ServiceTopologyEdge,
  ServiceTopologyNode,
} from '../types';

/**
 *
 */
export function asRecord(value: unknown): DomainRecord {
  if (typeof value !== 'object' || value === null) {
    return {};
  }
  return value as DomainRecord;
}

/**
 *
 */
export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/**
 *
 */
export function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 *
 */
export function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/**
 *
 */
export function countFromSummary(value: unknown): number {
  const row = asRecord(value);
  return toNumber(row.count);
}

export /**
        *
        */
const normalizeServiceMetric = (service: unknown = {}): ServiceMetric => {
  const row = asRecord(service);
  return {
    ...row,
    service_name: toStringValue(row.service_name ?? row.serviceName ?? row.name),
    request_count: toNumber(row.request_count ?? row.requestCount),
    error_count: toNumber(row.error_count ?? row.errorCount),
    avg_latency: toNumber(row.avg_latency ?? row.avgLatency),
    p50_latency: toNumber(row.p50_latency ?? row.p50Latency),
    p95_latency: toNumber(row.p95_latency ?? row.p95Latency),
    p99_latency: toNumber(row.p99_latency ?? row.p99Latency),
  };
};

export /**
        *
        */
const normalizeTimeSeriesPoint = (point: unknown = {}): ServiceTimeSeriesPoint => {
  const row = asRecord(point);
  return {
    ...row,
    timestamp: toStringValue(row.timestamp ?? row.time_bucket ?? row.timeBucket),
    service_name: toStringValue(row.service_name ?? row.serviceName),
    operation_name: toStringValue(row.operation_name ?? row.operationName),
    http_method: toStringValue(row.http_method ?? row.httpMethod),
    request_count: toNumber(row.request_count ?? row.requestCount),
    error_count: toNumber(row.error_count ?? row.errorCount),
    avg_latency: toNumber(row.avg_latency ?? row.avgLatency),
    p50: toNumber(row.p50 ?? row.p50_latency ?? row.p50Latency),
    p95: toNumber(row.p95 ?? row.p95_latency ?? row.p95Latency),
    p99: toNumber(row.p99 ?? row.p99_latency ?? row.p99Latency),
  };
};

export /**
        *
        */
const normalizeTopologyNode = (node: unknown = {}): ServiceTopologyNode => {
  const row = asRecord(node);
  return {
    ...row,
    name: toStringValue(row.name ?? row.service_name ?? row.serviceName),
    requestCount: toNumber(row.requestCount ?? row.request_count),
    errorRate: toNumber(row.errorRate ?? row.error_rate),
    avgLatency: toNumber(row.avgLatency ?? row.avg_latency),
    status: toStringValue(row.status),
  };
};

export /**
        *
        */
const normalizeTopologyEdge = (edge: unknown = {}): ServiceTopologyEdge => {
  const row = asRecord(edge);
  return {
    ...row,
    source: toStringValue(row.source ?? row.source_service ?? row.sourceService),
    target: toStringValue(row.target ?? row.target_service ?? row.targetService),
    callCount: toNumber(row.callCount ?? row.call_count),
    avgLatency: toNumber(row.avgLatency ?? row.avg_latency),
    errorRate: toNumber(row.errorRate ?? row.error_rate),
  };
};

/**
 *
 * @param errorRate
 */
export function getServiceStatus(errorRate: number): ServiceStatus {
  if (errorRate > 5) return 'unhealthy';
  if (errorRate > 1) return 'degraded';
  return 'healthy';
}

/**
 *
 * @param root0
 * @param root0.errorRate
 * @param root0.avgLatency
 * @param root0.dependencyCount
 */
export function calcRiskScore({
  errorRate,
  avgLatency,
  dependencyCount,
}: {
  errorRate: number;
  avgLatency: number;
  dependencyCount: number;
}): number {
  const errFactor = Math.min(errorRate * 12, 100);
  const latencyFactor = Math.min((avgLatency || 0) / 80, 100);
  const dependencyFactor = Math.min((dependencyCount || 0) * 8, 100);
  return Number((errFactor * 0.5 + latencyFactor * 0.3 + dependencyFactor * 0.2).toFixed(1));
}
