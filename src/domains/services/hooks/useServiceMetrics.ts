import { useMemo } from 'react';

import { servicesPageService } from '@services/servicesPageService';

import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';

import {
  asArray,
  toNumber,
  normalizeServiceMetric,
  normalizeTimeSeriesPoint,
  getServiceStatus,
} from '../utils/servicesUtils';

import type { ServiceMetric, ServiceTimeSeriesPoint, ServiceTableRow } from '../types';

/**
 *
 */
export function useServiceMetrics({
  searchQuery,
  sortField,
  sortOrder,
}: {
  searchQuery: string;
  sortField?: string | null;
  sortOrder?: 'ascend' | 'descend' | string | null;
}) {
  const { data: metricsRaw, isLoading: metricsLoading } = useTimeRangeQuery(
    'services-metrics',
    (teamId, startTime, endTime) => servicesPageService.getServiceMetrics(teamId, startTime, endTime),
  );

  const { data: serviceTimeseriesRaw, isLoading: timeseriesLoading } = useTimeRangeQuery(
    'service-timeseries-svc',
    (teamId, start, end) => servicesPageService.getServiceTimeSeries(teamId, start, end, '5m'),
  );

  const services = useMemo<ServiceMetric[]>(
    () => asArray(metricsRaw).map(normalizeServiceMetric),
    [metricsRaw],
  );

  const normalizedServiceTimeseries = useMemo<ServiceTimeSeriesPoint[]>(
    () => asArray(serviceTimeseriesRaw).map(normalizeTimeSeriesPoint),
    [serviceTimeseriesRaw],
  );

  const chartDataSources = useMemo<Record<string, unknown[]>>(
    () => ({
      'service-timeseries': normalizedServiceTimeseries,
      'services-metrics': services,
    }),
    [normalizedServiceTimeseries, services],
  );

  const requestTrendsByService = useMemo<Map<string, number[]>>(() => {
    const grouped = new Map<string, ServiceTimeSeriesPoint[]>();

    for (const point of normalizedServiceTimeseries) {
      if (!point.service_name) continue;

      const existing = grouped.get(point.service_name) || [];
      existing.push(point);
      grouped.set(point.service_name, existing);
    }

    const trends = new Map<string, number[]>();
    for (const [serviceName, points] of grouped.entries()) {
      const sorted = [...points].sort(
        (left, right) =>
          new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime(),
      );
      trends.set(
        serviceName,
        sorted.map((point) => toNumber(point.request_count)),
      );
    }

    return trends;
  }, [normalizedServiceTimeseries]);

  const serviceRows = useMemo<ServiceTableRow[]>(() => {
    return services.map((service) => {
      const requestCount = toNumber(service.request_count);
      const errorCount = toNumber(service.error_count);
      const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;

      return {
        serviceName: service.service_name,
        errorRate,
        requestCount,
        errorCount,
        avgLatency: toNumber(service.avg_latency),
        p95Latency: toNumber(service.p95_latency),
        p99Latency: toNumber(service.p99_latency),
        status: getServiceStatus(errorRate),
        requestTrend: requestTrendsByService.get(service.service_name) || null,
      };
    });
  }, [services, requestTrendsByService]);

  const tableData = useMemo<ServiceTableRow[]>(() => {
    const query = searchQuery.trim().toLowerCase();
    const filteredBySearch = query
      ? serviceRows.filter((service) => service.serviceName.toLowerCase().includes(query))
      : serviceRows;

    if (!sortField || !sortOrder) {
      return filteredBySearch;
    }

    return [...filteredBySearch].sort((left, right) => {
      const leftValue = left[sortField as keyof ServiceTableRow];
      const rightValue = right[sortField as keyof ServiceTableRow];

      let comparison = 0;
      if (typeof leftValue === 'number' && typeof rightValue === 'number') {
        comparison = leftValue - rightValue;
      } else {
        comparison = String(leftValue ?? '').localeCompare(String(rightValue ?? ''));
      }

      return sortOrder === 'ascend' ? comparison : -comparison;
    });
  }, [serviceRows, searchQuery, sortField, sortOrder]);

  return {
    metricsLoading,
    timeseriesLoading,
    chartDataSources,
    tableData,
  };
}
