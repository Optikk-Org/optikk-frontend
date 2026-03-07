import type { TraceRecord } from '../types';

export interface TraceStats {
  totalSpans: number;
  duration: number;
  services: Set<string>;
  errors: number;
}

/**
 * Calculate summary statistics for a trace from its spans.
 */
export const calculateTraceStats = (spans: TraceRecord[]): TraceStats => {
  const stats: TraceStats = {
    totalSpans: spans.length,
    duration: 0,
    services: new Set<string>(),
    errors: 0,
  };

  if (spans.length === 0) return stats;

  let minStart = Infinity;
  let maxEnd = -Infinity;

  spans.forEach((span) => {
    if (span.service_name) stats.services.add(span.service_name);
    if (span.status === 'ERROR') stats.errors++;

    const start = span.start_time ? new Date(span.start_time).getTime() : 0;
    const end = span.end_time ? new Date(span.end_time).getTime() : 0;

    if (start && start < minStart) minStart = start;
    if (end && end > maxEnd) maxEnd = end;
  });

  if (minStart !== Infinity && maxEnd !== -Infinity) {
    stats.duration = maxEnd - minStart;
  }

  return stats;
};

/**
 * Normalize span data from raw API response.
 */
export function normalizeSpan(span: any): TraceRecord {
  return {
    ...span,
    span_id: span.span_id || span.id,
    trace_id: span.trace_id || span.traceId,
    duration_ms: Number(span.duration_ms || span.duration || 0),
    start_time: span.start_time || span.startTime,
    end_time: span.end_time || span.endTime,
    status: span.status || (span.error ? 'ERROR' : 'OK'),
  };
}

/**
 * Normalize log data from raw API response.
 */
export function normalizeTraceLog(log: any): any {
  return {
    ...log,
    timestamp: log.timestamp || log.time,
    level: log.level || log.severityText || 'INFO',
  };
}
