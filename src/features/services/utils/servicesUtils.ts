import type {
  DomainRecord,
  ServiceMetric,
  ServiceStatus,
  ServiceTimeSeriesPoint,
  ServiceTopologyEdge,
  ServiceTopologyNode,
} from '../types';
import { asRecord as _asRecord, asArray, toNumber, toStringValue } from '@shared/utils/coerce';

export { asArray, toNumber, toStringValue };

export function asRecord(value: unknown): DomainRecord {
  return _asRecord(value) as DomainRecord;
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
    service_name: toStringValue(row.service_name),
    request_count: toNumber(row.request_count),
    error_count: toNumber(row.error_count),
    avg_latency: toNumber(row.avg_latency),
    p50_latency: toNumber(row.p50_latency),
    p95_latency: toNumber(row.p95_latency),
    p99_latency: toNumber(row.p99_latency),
  };
};

export /**
        *
        */
const normalizeTimeSeriesPoint = (point: unknown = {}): ServiceTimeSeriesPoint => {
  const row = asRecord(point);
  return {
    ...row,
    timestamp: toStringValue(row.timestamp),
    service_name: toStringValue(row.service_name),
    operation_name: toStringValue(row.operation_name),
    http_method: toStringValue(row.http_method),
    request_count: toNumber(row.request_count),
    error_count: toNumber(row.error_count),
    avg_latency: toNumber(row.avg_latency),
    p50: toNumber(row.p50),
    p95: toNumber(row.p95),
    p99: toNumber(row.p99),
  };
};

export /**
        *
        */
const normalizeTopologyNode = (node: unknown = {}): ServiceTopologyNode => {
  const row = asRecord(node);
  return {
    ...row,
    name: toStringValue(row.name),
    requestCount: toNumber(row.request_count),
    errorRate: toNumber(row.error_rate),
    avgLatency: toNumber(row.avg_latency),
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
    source: toStringValue(row.source),
    target: toStringValue(row.target),
    callCount: toNumber(row.call_count),
    avgLatency: toNumber(row.avg_latency),
    errorRate: toNumber(row.error_rate),
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
