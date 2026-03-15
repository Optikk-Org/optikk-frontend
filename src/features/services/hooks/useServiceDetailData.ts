import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { metricsService } from '@shared/api/metricsService';
import { logsService } from '@shared/api/logsService';

import { useAppStore } from '@store/appStore';

import type {
  ServiceDependency,
  ServiceEndpointRow,
  ServiceErrorGroupRow,
  ServiceLogRow,
  ServiceTimeSeriesPoint,
} from '../types';

const n = (value: unknown): number => (value == null || Number.isNaN(Number(value)) ? 0 : Number(value));

export const normalizeEndpoint = (row: Record<string, unknown> = {}): ServiceEndpointRow => ({
  ...row,
  service_name: String(row.service_name ?? ''),
  operation_name: String(row.operation_name ?? ''),
  http_method: String(row.http_method ?? ''),
  request_count: n(row.request_count),
  error_count: n(row.error_count),
  avg_latency: n(row.avg_latency),
  p95_latency: n(row.p95_latency),
  p99_latency: n(row.p99_latency),
});

export const normalizeErrorGroup = (row: Record<string, unknown> = {}): ServiceErrorGroupRow => ({
  ...row,
  service_name: String(row.service_name ?? ''),
  operation_name: String(row.operation_name ?? ''),
  status_message: String(row.status_message ?? ''),
  http_status_code: n(row.http_status_code),
  error_count: n(row.error_count),
  last_occurrence: String(row.last_occurrence ?? ''),
  first_occurrence: String(row.first_occurrence ?? ''),
  sample_trace_id: String(row.sample_trace_id ?? ''),
});

export const normalizeTimeSeriesPoint = (row: Record<string, unknown> = {}): ServiceTimeSeriesPoint => ({
  ...row,
  timestamp: String(row.timestamp ?? ''),
  service_name: String(row.service_name ?? ''),
  operation_name: String(row.operation_name ?? ''),
  http_method: String(row.http_method ?? ''),
  request_count: n(row.request_count),
  error_count: n(row.error_count),
  avg_latency: n(row.avg_latency),
  p50: n(row.p50),
  p95: n(row.p95),
  p99: n(row.p99),
});

export const normalizeLog = (row: Record<string, unknown> = {}): ServiceLogRow => ({
  ...row,
  timestamp: String(row.timestamp ?? ''),
  level: String(row.level ?? 'INFO'),
  message: String(row.message ?? ''),
  trace_id: String(row.trace_id ?? ''),
  span_id: String(row.span_id ?? ''),
});

export const normalizeDependency = (row: Record<string, unknown> = {}): ServiceDependency => ({
  ...row,
  source: String(row.source ?? ''),
  target: String(row.target ?? ''),
  call_count: n(row.call_count),
});

export interface UseServiceDetailDataProps {
  serviceName: string;
  activeTab: 'overview' | 'errors' | 'logs' | 'dependencies';
}

export function useServiceDetailData({ serviceName, activeTab }: UseServiceDetailDataProps) {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();

  const { data: endpointData, isLoading: endpointsLoading } = useQuery({
    queryKey: ['endpoint-breakdown', selectedTeamId, timeRange.value, serviceName, refreshKey],
    queryFn: () => {
      const endTime = Date.now();
      const timeRangeMinutes = timeRange.minutes ?? 0;
      const startTime = endTime - timeRangeMinutes * 60 * 1000;
      return metricsService.getEndpointBreakdown(selectedTeamId, startTime, endTime, serviceName);
    },
    enabled: !!selectedTeamId && serviceName.length > 0,
  });

  const { data: errorData, isLoading: errorsLoading } = useQuery({
    queryKey: ['error-groups', selectedTeamId, timeRange.value, serviceName, refreshKey],
    queryFn: () => {
      const endTime = Date.now();
      const timeRangeMinutes = timeRange.minutes ?? 0;
      const startTime = endTime - timeRangeMinutes * 60 * 1000;
      return metricsService.getErrorGroups(selectedTeamId, startTime, endTime, serviceName);
    },
    enabled: !!selectedTeamId && serviceName.length > 0,
  });

  const { data: timeSeriesData, isLoading: timeSeriesLoading } = useQuery({
    queryKey: ['metrics-timeseries', selectedTeamId, timeRange.value, serviceName, refreshKey],
    queryFn: () => {
      const endTime = Date.now();
      const timeRangeMinutes = timeRange.minutes ?? 0;
      const startTime = endTime - timeRangeMinutes * 60 * 1000;
      return metricsService.getMetricsTimeSeries(selectedTeamId, startTime, endTime, serviceName, '5m');
    },
    enabled: !!selectedTeamId && serviceName.length > 0,
  });

  // Fetch service logs
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['service-logs', selectedTeamId, timeRange.value, serviceName, refreshKey],
    queryFn: () => {
      const endTime = Date.now();
      const timeRangeMinutes = timeRange.minutes ?? 0;
      const startTime = endTime - timeRangeMinutes * 60 * 1000;
      return logsService.getLogs(selectedTeamId, startTime, endTime, {
        services: [serviceName],
        limit: 50,
        offset: 0,
      });
    },
    enabled: !!selectedTeamId && serviceName.length > 0 && activeTab === 'logs',
  });

  // Fetch service dependencies
  const { data: dependenciesData } = useQuery({
    queryKey: ['service-dependencies', selectedTeamId, timeRange.value, serviceName, refreshKey],
    queryFn: () => {
      const endTime = Date.now();
      const timeRangeMinutes = timeRange.minutes ?? 0;
      const startTime = endTime - timeRangeMinutes * 60 * 1000;
      return metricsService.getServiceDependencies(selectedTeamId, startTime, endTime);
    },
    enabled: !!selectedTeamId && serviceName.length > 0 && activeTab === 'dependencies',
  });

  const endpoints = Array.isArray(endpointData)
    ? endpointData.map((row) => normalizeEndpoint((row as Record<string, unknown>) || {}))
    : [];
  const errorGroups = Array.isArray(errorData)
    ? errorData.map((row) => normalizeErrorGroup((row as Record<string, unknown>) || {}))
    : [];
  const timeSeries = Array.isArray(timeSeriesData)
    ? timeSeriesData.map((row) => normalizeTimeSeriesPoint((row as Record<string, unknown>) || {}))
    : [];
  const logsRaw = (logsData as { logs?: unknown[] } | undefined)?.logs;
  const logs = Array.isArray(logsRaw)
    ? logsRaw.map((row) => normalizeLog((row as Record<string, unknown>) || {}))
    : [];
  const dependencies = Array.isArray(dependenciesData)
    ? dependenciesData.map((row) => normalizeDependency((row as Record<string, unknown>) || {}))
    : [];
  const isLoading = endpointsLoading || errorsLoading || timeSeriesLoading;

  // Filter dependencies for this service
  const serviceDependencies = useMemo(() => {
    return dependencies.filter(
      (dependency: ServiceDependency) =>
        dependency.source === serviceName || dependency.target === serviceName,
    );
  }, [dependencies, serviceName]);

  const stats = useMemo(
    () =>
      endpoints.reduce(
        (
          accumulator: { totalRequests: number; totalErrors: number; latencies: number[]; p95Latencies: number[] },
          endpoint: ServiceEndpointRow,
        ) => {
          accumulator.totalRequests += endpoint.request_count || 0;
          accumulator.totalErrors += endpoint.error_count || 0;
          accumulator.latencies.push(endpoint.avg_latency || 0);
          accumulator.p95Latencies.push(endpoint.p95_latency || 0);
          return accumulator;
        },
        { totalRequests: 0, totalErrors: 0, latencies: [], p95Latencies: [] },
      ),
    [endpoints],
  );

  const errorRate = stats.totalRequests > 0 ? (stats.totalErrors / stats.totalRequests) * 100 : 0;

  const avgLatency =
    stats.latencies.length > 0
      ? stats.latencies.reduce((left: number, right: number) => left + right, 0) /
        stats.latencies.length
      : 0;

  const p95Latency = stats.p95Latencies.length > 0 ? Math.max(...stats.p95Latencies) : 0;

  // Build sparkline data from timeseries
  const requestsSparkline = useMemo(
    () => timeSeries.map((point: ServiceTimeSeriesPoint) => point.request_count || 0),
    [timeSeries],
  );

  const errorSparkline = useMemo(() => {
    return timeSeries.map((point: ServiceTimeSeriesPoint) => {
      const total = point.request_count || 0;
      const errors = point.error_count || 0;
      return total > 0 ? (errors / total) * 100 : 0;
    });
  }, [timeSeries]);

  return {
    endpoints,
    errorGroups,
    timeSeries,
    logs,
    serviceDependencies,
    stats,
    errorRate,
    avgLatency,
    p95Latency,
    requestsSparkline,
    errorSparkline,
    isLoading,
    endpointsLoading,
    errorsLoading,
    timeSeriesLoading,
    logsLoading,
  };
}
