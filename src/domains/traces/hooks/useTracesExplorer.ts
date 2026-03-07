import { useQuery } from '@tanstack/react-query';
import { useState, useMemo, useCallback } from 'react';

import type { QueryParams } from '@services/service-types';
import { v1Service } from '@services/v1Service';

import { useURLFilters } from '@hooks/useURLFilters';

import { useAppStore } from '@store/appStore';

import { toNumber, normalizeTracesResponse, normalizeTrace, type TracesResponse } from '../utils/tracesUtils';

import type { TraceRecord, ServiceBadge } from '../types';

const TRACES_URL_FILTER_CONFIG = {
  params: [
    { key: 'search', type: 'string' as const, defaultValue: '' },
    { key: 'service', type: 'string' as const, defaultValue: '' },
    { key: 'errorsOnly', type: 'boolean' as const, defaultValue: false },
  ],
  syncStructuredFilters: true,
};

/**
 * Traces hub page with KPIs, charts, and structured trace explorer.
 * @returns Traces page.
 */
export function useTracesExplorer() {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();

  const {
    values: urlValues,
    setters: urlSetters,
    structuredFilters: filters,
    setStructuredFilters: setFilters,
    clearAll: clearURLFilters,
  } = useURLFilters(TRACES_URL_FILTER_CONFIG);

  const searchText = typeof urlValues.search === 'string' ? urlValues.search : '';
  const selectedService =
    typeof urlValues.service === 'string' && urlValues.service.length > 0 ? urlValues.service : null;
  const errorsOnly = urlValues.errorsOnly === true;

  const setSearchText = (value: string): void => {
    urlSetters.search(value);
  };

  const setSelectedService = (value: string | null): void => {
    urlSetters.service(value || '');
  };

  const setErrorsOnly = (value: boolean): void => {
    urlSetters.errorsOnly(value);
  };

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const backendParams = useMemo((): QueryParams => {
    const params: QueryParams = {
      limit: pageSize,
      offset: (page - 1) * pageSize,
    };

    if (errorsOnly) params.status = 'ERROR';
    if (selectedService) params.services = [selectedService];

    for (const filter of filters) {
      if (filter.field === 'status' && filter.operator === 'equals') params.status = filter.value;
      if (filter.field === 'service_name' && filter.operator === 'equals') {
        params.services = [filter.value];
      }
      if (filter.field === 'duration_ms' && filter.operator === 'gt') {
        params.minDuration = Number(filter.value);
      }
      if (filter.field === 'duration_ms' && filter.operator === 'lt') {
        params.maxDuration = Number(filter.value);
      }
      if (filter.field === 'trace_id' && filter.operator === 'equals') params.traceId = filter.value;
      if (
        filter.field === 'operation_name' &&
        (filter.operator === 'equals' || filter.operator === 'contains')
      ) {
        params.operationName = filter.value;
      }
      if (filter.field === 'http_method' && filter.operator === 'equals') {
        params.httpMethod = filter.value;
      }
      if (filter.field === 'http_status' && filter.operator === 'equals') {
        params.httpStatusCode = filter.value;
      }
    }

    return params;
  }, [filters, selectedService, errorsOnly, pageSize, page]);

  const { data, isLoading } = useQuery<TracesResponse>({
    queryKey: ['traces-v3', selectedTeamId, timeRange.value, refreshKey, backendParams],
    queryFn: async (): Promise<TracesResponse> => {
      const endTime = Date.now();
      const timeRangeMinutes = timeRange.minutes ?? 0;
      const startTime = endTime - timeRangeMinutes * 60 * 1000;
      const response = await v1Service.getTraces(selectedTeamId, startTime, endTime, backendParams);
      return normalizeTracesResponse(response);
    },
    enabled: !!selectedTeamId,
  });

  const rawTraces = useMemo(
    () => (Array.isArray(data?.traces) ? data.traces : []).map(normalizeTrace),
    [data?.traces],
  );

  const traces = useMemo((): TraceRecord[] => {
    let filteredTraces = rawTraces;

    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      filteredTraces = filteredTraces.filter(
        (trace: TraceRecord) =>
          trace.trace_id.toLowerCase().includes(query) ||
          trace.service_name.toLowerCase().includes(query) ||
          trace.operation_name.toLowerCase().includes(query),
      );
    }

    for (const filter of filters) {
      const value = String(filter.value ?? '').toLowerCase();
      if (!value) continue;

      filteredTraces = filteredTraces.filter((trace: TraceRecord) => {
        if (filter.field === 'trace_id') {
          return filter.operator === 'contains'
            ? trace.trace_id.toLowerCase().includes(value)
            : trace.trace_id.toLowerCase() === value;
        }

        if (filter.field === 'operation_name') {
          return filter.operator === 'equals'
            ? trace.operation_name.toLowerCase() === value
            : trace.operation_name.toLowerCase().includes(value);
        }

        if (filter.field === 'service_name' && filter.operator === 'contains') {
          return trace.service_name.toLowerCase().includes(value);
        }

        if (filter.field === 'http_method') {
          return (trace?.http_method || '').toLowerCase() === value;
        }

        if (filter.field === 'http_status') {
          const code = Number(filter.value);
          if (filter.operator === 'gt') return (trace?.http_status_code ?? 0) > code;
          if (filter.operator === 'lt') return (trace?.http_status_code ?? 0) < code;
          return (trace?.http_status_code ?? 0) === code;
        }

        if (filter.field === 'duration_ms') {
          const duration = Number(filter.value);
          if (filter.operator === 'gt') return trace.duration_ms > duration;
          if (filter.operator === 'lt') return trace.duration_ms < duration;
        }

        return true;
      });
    }

    return filteredTraces;
  }, [rawTraces, searchText, filters]);

  const total = data?.total || 0;
  const summary = data?.summary || {};
  const totalTraces = toNumber(summary.total_traces ?? summary.totalTraces ?? total ?? rawTraces.length);
  const errorTraces = toNumber(summary.error_traces ?? summary.errorTraces);
  const errorRate = totalTraces > 0 ? (errorTraces * 100) / totalTraces : 0;
  const p95 = toNumber(summary.p95_duration ?? summary.p95Duration);
  const p99 = toNumber(summary.p99_duration ?? summary.p99Duration);

  const maxDuration = useMemo(
    () => Math.max(...traces.map((trace) => trace.duration_ms), 1),
    [traces],
  );

  const serviceBadges = useMemo<ServiceBadge[]>(() => {
    const counts: Record<string, number> = {};

    for (const trace of rawTraces) {
      if (trace.service_name) {
        counts[trace.service_name] = (counts[trace.service_name] || 0) + 1;
      }
    }

    return Object.entries(counts).sort((left, right) => right[1] - left[1]);
  }, [rawTraces]);

  const clearAll = useCallback((): void => {
    clearURLFilters();
    setPage(1);
  }, [clearURLFilters]);

  return {
    isLoading,
    traces,
    total,
    totalTraces,
    errorTraces,
    errorRate,
    p95,
    p99,
    serviceBadges,
    maxDuration,
    searchText,
    selectedService,
    errorsOnly,
    page,
    pageSize,
    filters,
    setSearchText,
    setSelectedService,
    setErrorsOnly,
    setPage,
    setPageSize,
    setFilters,
    clearAll,
  };
}