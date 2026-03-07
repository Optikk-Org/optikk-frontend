import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { v1Service } from '@services/v1Service';

import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { useAppStore } from '@store/appStore';

import { fillVolumeBucketGaps } from '@utils/logUtils';

import type {
  LogFacet,
  LogRecord,
  LogsBackendParams,
  LogsListResponse,
  LogsStatsResponse,
  LogVolumeBucket,
  LogsVolumeResponse,
  LogStructuredFilter,
} from '../types';

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return {};
  }
  return value as Record<string, unknown>;
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function normalizeId(value: unknown): string | number | bigint | undefined {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'bigint'
  ) {
    return value;
  }
  return undefined;
}

function normalizeTimestamp(value: unknown): string | number | Date | undefined {
  if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
    return value;
  }
  return undefined;
}

function normalizeLogRecord(input: unknown): LogRecord {
  const row = asRecord(input);

  return {
    ...row,
    id: normalizeId(row.id),
    timestamp: normalizeTimestamp(row.timestamp),
    level: toStringValue(row.level),
    service_name: toStringValue(row.service_name ?? row.serviceName),
    serviceName: toStringValue(row.serviceName ?? row.service_name),
    host: toStringValue(row.host),
    pod: toStringValue(row.pod),
    container: toStringValue(row.container),
    logger: toStringValue(row.logger),
    thread: toStringValue(row.thread),
    traceId: toStringValue(row.traceId ?? row.trace_id),
    trace_id: toStringValue(row.trace_id ?? row.traceId),
    spanId: toStringValue(row.spanId ?? row.span_id),
    span_id: toStringValue(row.span_id ?? row.spanId),
    message: toStringValue(row.message),
  };
}

function normalizeFacet(input: unknown): LogFacet {
  const row = asRecord(input);

  return {
    ...row,
    value: toStringValue(row.value),
    count: toNumber(row.count),
  };
}

function normalizeVolumeBucket(input: unknown): LogVolumeBucket {
  const row = asRecord(input);

  return {
    ...row,
    timeBucket: toStringValue(row.timeBucket ?? row.time_bucket),
    time_bucket: toStringValue(row.time_bucket ?? row.timeBucket),
    total: toNumber(row.total),
    errors: toNumber(row.errors),
    warnings: toNumber(row.warnings),
    infos: toNumber(row.infos),
    debugs: toNumber(row.debugs),
    fatals: toNumber(row.fatals),
  };
}

function normalizeLogsResponse(value: unknown): LogsListResponse {
  const row = asRecord(value);
  const logsRaw = Array.isArray(row.logs) ? row.logs : [];

  return {
    logs: logsRaw.map(normalizeLogRecord),
    total: toNumber(row.total),
  };
}

function normalizeStatsResponse(value: unknown): LogsStatsResponse {
  const row = asRecord(value);
  const fields = asRecord(row.fields);

  const level = Array.isArray(fields.level) ? fields.level.map(normalizeFacet) : [];
  const serviceName = Array.isArray(fields.service_name)
    ? fields.service_name.map(normalizeFacet)
    : [];

  return {
    total: toNumber(row.total),
    fields: {
      level,
      service_name: serviceName,
    },
  };
}

function normalizeVolumeResponse(value: unknown): LogsVolumeResponse {
  const row = asRecord(value);
  const bucketsRaw = Array.isArray(row.buckets) ? row.buckets : [];

  return {
    step: toStringValue(row.step),
    buckets: bucketsRaw.map(normalizeVolumeBucket),
  };
}

export interface UseLogsHubDataProps {
  searchText: string;
  selectedService: string | null;
  errorsOnly: boolean;
  filters: LogStructuredFilter[];
  page: number;
  pageSize: number;
}

export function useLogsHubData({
  searchText,
  selectedService,
  errorsOnly,
  filters,
  page,
  pageSize,
}: UseLogsHubDataProps) {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();

  /* ── Backend params derived from filters ── */
  const backendParams = useMemo((): LogsBackendParams => {
    const params: LogsBackendParams = { limit: pageSize, offset: (page - 1) * pageSize };

    if (searchText.trim()) params.search = searchText.trim();
    if (errorsOnly) params.levels = ['ERROR', 'FATAL'];
    if (selectedService) params.services = [selectedService];

    for (const filter of filters) {
      if (filter.field === 'level' && filter.operator === 'equals') {
        params.levels = [filter.value.toUpperCase()];
      }
      if (filter.field === 'level' && filter.operator === 'not_equals') {
        params.excludeLevels = [filter.value.toUpperCase()];
      }
      if (filter.field === 'service_name' && filter.operator === 'equals') {
        params.services = [filter.value];
      }
      if (filter.field === 'service_name' && filter.operator === 'not_equals') {
        params.excludeServices = [filter.value];
      }
      if (filter.field === 'host' && filter.operator === 'equals') {
        params.hosts = [filter.value];
      }
      if (filter.field === 'host' && filter.operator === 'not_equals') {
        params.excludeHosts = [filter.value];
      }
      if (filter.field === 'pod') {
        params.pods = [filter.value];
      }
      if (filter.field === 'container') {
        params.containers = [filter.value];
      }
      if (filter.field === 'logger') {
        params.loggers = [filter.value];
      }
      if (filter.field === 'trace_id') {
        params.traceId = filter.value;
      }
      if (filter.field === 'span_id') {
        params.spanId = filter.value;
      }
    }

    return params;
  }, [filters, selectedService, errorsOnly, searchText, pageSize, page]);

  /* ── Stats query (for KPI + level facets) ── */
  const { data: statsData, isLoading: statsLoading } = useTimeRangeQuery<LogsStatsResponse>(
    'logs-stats',
    async (teamId, startTime, endTime): Promise<LogsStatsResponse> => {
      const response = await v1Service.getLogStats(teamId, startTime, endTime, backendParams);
      return normalizeStatsResponse(response);
    },
    { extraKeys: [JSON.stringify(backendParams)] },
  );

  /* ── Volume query ── */
  const { data: volumeData, isLoading: volumeLoading } = useTimeRangeQuery<LogsVolumeResponse>(
    'logs-volume',
    async (teamId, startTime, endTime): Promise<LogsVolumeResponse> => {
      const response = await v1Service.getLogVolume(teamId, startTime, endTime, undefined, backendParams);
      return normalizeVolumeResponse(response);
    },
    { extraKeys: [JSON.stringify(backendParams)] },
  );

  /* ── Logs query ── */
  const { data: logsData, isLoading: logsLoading } = useQuery<LogsListResponse>({
    queryKey: ['logs-list', selectedTeamId, timeRange.value, refreshKey, backendParams],
    queryFn: async (): Promise<LogsListResponse> => {
      const endTime = Date.now();
      const timeRangeMinutes = timeRange.minutes ?? 0;
      const startTime = endTime - timeRangeMinutes * 60 * 1000;
      const response = await v1Service.getLogs(selectedTeamId, startTime, endTime, backendParams);
      return normalizeLogsResponse(response);
    },
    enabled: !!selectedTeamId,
  });

  /* ── Derived data ── */
  const logs = useMemo((): LogRecord[] => logsData?.logs || [], [logsData?.logs]);
  const total = logsData?.total || 0;
  const levelFacets = useMemo((): LogFacet[] => statsData?.fields.level || [], [statsData?.fields.level]);
  const serviceFacets = useMemo(
    (): LogFacet[] => statsData?.fields.service_name || [],
    [statsData?.fields.service_name],
  );

  const volumeBuckets = useMemo((): LogVolumeBucket[] => {
    return fillVolumeBucketGaps<LogVolumeBucket>(
      volumeData?.buckets || [], 
      volumeData?.step || '', 
      timeRange.minutes ?? 0
    );
  }, [volumeData?.buckets, volumeData?.step, timeRange.minutes]);

  const errorCount = useMemo((): number => {
    return levelFacets
      .filter((facet: LogFacet) => ['ERROR', 'FATAL'].includes((facet.value || '').toUpperCase()))
      .reduce((sum: number, facet: LogFacet) => sum + (facet.count || 0), 0);
  }, [levelFacets]);

  const warnCount = useMemo((): number => {
    return levelFacets
      .filter((facet: LogFacet) => ['WARN', 'WARNING'].includes((facet.value || '').toUpperCase()))
      .reduce((sum: number, facet: LogFacet) => sum + (facet.count || 0), 0);
  }, [levelFacets]);

  const totalCount = statsData?.total || total || logs.length;

  return {
    logs,
    logsLoading,
    total,
    volumeBuckets,
    volumeLoading,
    errorCount,
    warnCount,
    totalCount,
    serviceFacets,
    levelFacets,
    backendParams,
    statsLoading,
  };
}
