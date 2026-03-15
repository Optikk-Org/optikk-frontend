import type { TraceRecord } from '../types';

interface TraceFilterOperator {
  key: string;
  label: string;
  symbol: string;
}

interface TraceFilterField {
  key: string;
  label: string;
  icon: string;
  group: string;
  operators: TraceFilterOperator[];
}

interface TracesSummary extends Record<string, unknown> {
  total_traces?: number;
  error_traces?: number;
  p95_duration?: number;
  p99_duration?: number;
}

/**
 *
 */
export interface TracesResponse {
  traces: unknown[];
  total: number;
  summary: TracesSummary;
}

/**
 *
 */
export function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return {};
  }

  const record: Record<string, unknown> = {};
  for (const [key, entryValue] of Object.entries(value)) {
    record[key] = entryValue;
  }
  return record;
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
export function normalizeTracesResponse(value: unknown): TracesResponse {
  const row = asRecord(value);
  const traces = Array.isArray(row.traces) ? row.traces.map((trace) => normalizeTrace(trace)) : [];
  const summary = asRecord(row.summary) as TracesSummary;
  const total = toNumber(row.total ?? summary.total_traces);
  return { traces, total, summary };
}

/**
 *
 */
export function normalizeTrace(input: unknown): TraceRecord {
  const row = asRecord(input);
  return {
    ...row,
    span_id: toStringValue(row.span_id),
    trace_id: toStringValue(row.trace_id),
    service_name: toStringValue(row.service_name),
    operation_name: toStringValue(row.operation_name),
    start_time: toStringValue(row.start_time),
    end_time: toStringValue(row.end_time),
    duration_ms: toNumber(row.duration_ms),
    status: toStringValue(row.status) || 'UNSET',
    span_kind: toStringValue(row.span_kind),
    http_method: toStringValue(row.http_method),
    http_status_code: toNumber(row.http_status_code),
  };
}

/**
 * Filter fields used by the shared ObservabilityQueryBar on traces page.
 */
export const TRACE_FILTER_FIELDS: TraceFilterField[] = [
  {
    key: 'trace_id',
    label: 'Trace ID',
    icon: '🔗',
    group: 'Trace',
    operators: [
      { key: 'equals', label: 'equals', symbol: '=' },
      { key: 'contains', label: 'contains', symbol: '~' },
    ],
  },
  {
    key: 'operation_name',
    label: 'Operation',
    icon: '⚡',
    group: 'Trace',
    operators: [
      { key: 'equals', label: 'equals', symbol: '=' },
      { key: 'contains', label: 'contains', symbol: '~' },
    ],
  },
  {
    key: 'status',
    label: 'Status',
    icon: '🔵',
    group: 'Trace',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'service_name',
    label: 'Service',
    icon: '⚙️',
    group: 'Service',
    operators: [
      { key: 'equals', label: 'equals', symbol: '=' },
      { key: 'contains', label: 'contains', symbol: '~' },
    ],
  },
  {
    key: 'http_method',
    label: 'HTTP Method',
    icon: '🌐',
    group: 'HTTP',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'http_status',
    label: 'HTTP Status Code',
    icon: '📡',
    group: 'HTTP',
    operators: [
      { key: 'equals', label: 'equals', symbol: '=' },
      { key: 'gt', label: 'greater than', symbol: '>' },
      { key: 'lt', label: 'less than', symbol: '<' },
    ],
  },
  {
    key: 'duration_ms',
    label: 'Duration (ms)',
    icon: '⏱',
    group: 'Performance',
    operators: [
      { key: 'gt', label: 'greater than', symbol: '>' },
      { key: 'lt', label: 'less than', symbol: '<' },
    ],
  },
];

import type { TraceColumn } from '../types';

/**
 *
 */
export const TRACE_COLUMNS: TraceColumn[] = [
  { key: 'trace_id', label: 'Trace ID', defaultWidth: 185, defaultVisible: true },
  { key: 'service_name', label: 'Service', defaultWidth: 155, defaultVisible: true },
  { key: 'status', label: 'Status', defaultWidth: 100, defaultVisible: true },
  { key: 'duration_ms', label: 'Duration', defaultWidth: 135, defaultVisible: true },
  { key: 'http_status_code', label: 'HTTP Code', defaultWidth: 90, defaultVisible: false },
  { key: 'start_time', label: 'Start Time', defaultWidth: 165, defaultVisible: true },
  { key: 'operation_name', label: 'Operation', defaultVisible: true, flex: true },
];
