import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  GitBranch,
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageHeader, ObservabilityDetailPanel } from '@components/common';
import ConfiguredTabPanel from '@components/dashboard/ConfiguredTabPanel';

import LogRow, { LevelBadge } from '../../components/log/LogRow';
import LogsLevelDistributionCard from '../../components/charts/LogsLevelDistributionCard';
import LogsVolumeSection from '../../components/charts/LogsVolumeSection';
import LogsKpiRow from '../../components/kpi/LogsKpiRow';
import LogsTableSection from '../../components/table/LogsTableSection';

import { v1Service } from '@services/v1Service';

import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { useURLFilters } from '@hooks/useURLFilters';

import { useAppStore } from '@store/appStore';

import { relativeTime, tsLabel } from '@utils/time';

import type {
  LogColumn,
  LogFacet,
  LogFilterField,
  LogRecord,
  LogsBackendParams,
  LogsBoardRenderContext,
  LogsListResponse,
  LogsStatsResponse,
  LogVolumeBucket,
  LogsVolumeResponse,
  LogStructuredFilter,
} from '../../types';

import './LogsHubPage.css';

const STEP_MS_BY_LABEL: Record<string, number> = {
  '1m': 60_000,
  '2m': 120_000,
  '5m': 300_000,
  '10m': 600_000,
  '15m': 900_000,
  '30m': 1_800_000,
  '1h': 3_600_000,
  '2h': 7_200_000,
  '6h': 21_600_000,
  '12h': 43_200_000,
};

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

function toDisplayText(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch (_error: unknown) {
    return String(value);
  }
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

function formatUtcBucketKey(date: Date): string {
  const pad = (value: number): string => String(value).padStart(2, '0');
  const dateLabel = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  const timeLabel = `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:00`;
  return `${dateLabel} ${timeLabel}`;
}

/* ─── Filter fields ───────────────────────────────────────────────────────── */
export /**
        *
        */
const LOG_FILTER_FIELDS: LogFilterField[] = [
  {
    key: 'service_name', label: 'Service', icon: '⚙️', group: 'Service',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }, { key: 'not_equals', label: 'not equals', symbol: '!=' }],
  },
  {
    key: 'level', label: 'Level', icon: '🎚️', group: 'Log',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }, { key: 'not_equals', label: 'not equals', symbol: '!=' }],
  },
  {
    key: 'host', label: 'Host', icon: '🖥️', group: 'Infrastructure',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }, { key: 'not_equals', label: 'not equals', symbol: '!=' }],
  },
  {
    key: 'pod', label: 'Pod', icon: '📦', group: 'Infrastructure',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'container', label: 'Container', icon: '🐳', group: 'Infrastructure',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'logger', label: 'Logger', icon: '📝', group: 'Log',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'trace_id', label: 'Trace ID', icon: '🔗', group: 'Correlation',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'span_id', label: 'Span ID', icon: '🔀', group: 'Correlation',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
];

/* ─── Column definitions ──────────────────────────────────────────────────── */
const LOG_COLUMNS: LogColumn[] = [
  { key: 'timestamp', label: 'Time', defaultWidth: 175, defaultVisible: true },
  { key: 'level', label: 'Level', defaultWidth: 80, defaultVisible: true },
  { key: 'service_name', label: 'Service', defaultWidth: 160, defaultVisible: true },
  { key: 'host', label: 'Host/Pod', defaultWidth: 140, defaultVisible: false },
  { key: 'logger', label: 'Logger', defaultWidth: 160, defaultVisible: false },
  { key: 'trace_id', label: 'Trace ID', defaultWidth: 220, defaultVisible: false },
  { key: 'thread', label: 'Thread', defaultWidth: 120, defaultVisible: false },
  { key: 'container', label: 'Container', defaultWidth: 140, defaultVisible: false },
  { key: 'message', label: 'Message', defaultVisible: true, flex: true },
];

/* ─── URL filter config ────────────────────────────────────────────────── */
const LOGS_URL_FILTER_CONFIG = {
  params: [
    { key: 'search', type: 'string' as const, defaultValue: '' },
    { key: 'service', type: 'string' as const, defaultValue: '' },
    { key: 'errorsOnly', type: 'boolean' as const, defaultValue: false },
  ],
  syncStructuredFilters: true,
};

/* ─── Main page ───────────────────────────────────────────────────────────── */
/**
 *
 */
export default function LogsHubPage() {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const navigate = useNavigate();

  /* ── URL-synced filter state ── */
  const {
    values: urlValues,
    setters: urlSetters,
    structuredFilters: filters,
    setStructuredFilters: setFilters,
    clearAll: clearURLFilters,
  } = useURLFilters(LOGS_URL_FILTER_CONFIG);

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

  /* ── Local-only state (not worth putting in URL) ── */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedLog, setSelectedLog] = useState<LogRecord | null>(null);

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

  // Client-side gap fill: ensure ~30 evenly spaced bars even if backend has sparse data
  const volumeBuckets = useMemo((): LogVolumeBucket[] => {
    const raw = volumeData?.buckets || [];
    const step = volumeData?.step || '';
    if (!raw.length || !step) return raw;

    const stepMs = STEP_MS_BY_LABEL[step] || 60_000;

    const endMs = Date.now();
    const timeRangeMinutes = timeRange.minutes ?? 0;
    const startMs = endMs - timeRangeMinutes * 60 * 1000;

    const byKey: Record<string, LogVolumeBucket> = {};
    for (const bucket of raw) {
      const key = bucket.timeBucket || bucket.time_bucket || '';
      if (key) {
        byKey[key] = bucket;
      }
    }

    const result: LogVolumeBucket[] = [];
    const slotStart = Math.floor(startMs / stepMs) * stepMs;
    for (let timestamp = slotStart; timestamp <= endMs; timestamp += stepMs) {
      const key = formatUtcBucketKey(new Date(timestamp));
      result.push(
        byKey[key] || {
          timeBucket: key,
          total: 0,
          errors: 0,
          warnings: 0,
          infos: 0,
          debugs: 0,
          fatals: 0,
        },
      );
    }

    return result;
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

  const clearAll = useCallback((): void => {
    clearURLFilters();
    setPage(1);
  }, [clearURLFilters]);

  /* ── Board row renderer ── */
  const renderRow = useCallback(
    (log: LogRecord, { colWidths, visibleCols }: LogsBoardRenderContext) => (
      <LogRow
        log={log}
        colWidths={colWidths}
        visibleCols={visibleCols}
        columns={LOG_COLUMNS}
        onOpenDetail={setSelectedLog}
      />
    ),
    [],
  );

  /* ── Detail panel fields ── */
  const detailFields = selectedLog
    ? [
      { key: 'timestamp', label: 'Timestamp', value: tsLabel(selectedLog.timestamp) },
      { key: 'level', label: 'Level', value: selectedLog.level, filterable: true },
      { key: 'service_name', label: 'Service', value: selectedLog.service_name || selectedLog.serviceName, filterable: true },
      { key: 'host', label: 'Host', value: selectedLog.host, filterable: true },
      { key: 'pod', label: 'Pod', value: selectedLog.pod },
      { key: 'container', label: 'Container', value: selectedLog.container },
      { key: 'logger', label: 'Logger', value: selectedLog.logger },
      { key: 'thread', label: 'Thread', value: selectedLog.thread },
      { key: 'trace_id', label: 'Trace ID', value: selectedLog.traceId || selectedLog.trace_id, filterable: true },
      { key: 'span_id', label: 'Span ID', value: selectedLog.spanId || selectedLog.span_id },
    ].filter((field) => field.value !== null && field.value !== undefined && field.value !== '')
    : [];

  const traceId = selectedLog ? selectedLog.traceId || selectedLog.trace_id : '';
  const selectedLogMessage = selectedLog ? toDisplayText(selectedLog.message) : '—';

  return (
    <div className="logs-page">
      <PageHeader title="Logs" icon={<FileText size={24} />} />

      <LogsKpiRow
        errorCount={errorCount}
        warnCount={warnCount}
        serviceCount={serviceFacets.length}
        totalCount={totalCount}
      />

      <div className="logs-charts-row">
        <LogsVolumeSection volumeBuckets={volumeBuckets} isLoading={volumeLoading} />
        <LogsLevelDistributionCard isLoading={statsLoading} levelFacets={levelFacets} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <ConfiguredTabPanel pageId="logs" tabId="default" />
      </div>

      <LogsTableSection
        columns={LOG_COLUMNS}
        logs={logs}
        total={total}
        page={page}
        pageSize={pageSize}
        logsLoading={logsLoading}
        serviceFacets={serviceFacets}
        selectedService={selectedService}
        filters={filters}
        searchText={searchText}
        errorsOnly={errorsOnly}
        filterFields={LOG_FILTER_FIELDS}
        onSelectService={(value: string | null) => {
          setSelectedService(value);
          setPage(1);
        }}
        onSetFilters={(nextFilters: LogStructuredFilter[]) => {
          setFilters(nextFilters);
          setPage(1);
        }}
        onSetSearchText={(value: string) => {
          setSearchText(value);
          setPage(1);
        }}
        onToggleErrorsOnly={(value: boolean) => {
          setErrorsOnly(value);
          setPage(1);
        }}
        onClearAll={clearAll}
        onSetPage={setPage}
        onSetPageSize={setPageSize}
        renderRow={renderRow}
      />

      {/* ── Log detail panel ── */}
      {selectedLog && (
        <ObservabilityDetailPanel
          title="Log Detail"
          titleBadge={<LevelBadge level={selectedLog.level} />}
          metaLine={tsLabel(selectedLog.timestamp)}
          metaRight={relativeTime(selectedLog.timestamp)}
          summaryNode={
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 12,
                color: 'var(--text-primary)',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
              }}
            >
              {selectedLogMessage}
            </span>
          }
          actions={
            traceId ? (
              <button
                className="logs-view-trace-btn"
                onClick={() => navigate(`/traces/${traceId}`)}
              >
                <GitBranch size={13} />
                View Trace
              </button>
            ) : null
          }
          fields={detailFields}
          rawData={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}
