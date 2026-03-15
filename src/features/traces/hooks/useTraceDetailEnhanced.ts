import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { tracesService } from '@shared/api/tracesService';
import type {
  CriticalPathSpan,
  ErrorPathSpan,
  SpanAttributes,
  SpanEvent,
  SpanKindDuration,
  SpanSelfTime,
  RelatedTrace,
} from '../types';

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toStringValue = (value: unknown): string => (typeof value === 'string' ? value : '');

export function useTraceDetailEnhanced(
  traceId: string,
  selectedSpanId: string | null,
  relatedContext?: { service_name?: string; operation_name?: string } | null,
  startMs?: number,
  endMs?: number,
) {
  const enabled = !!traceId;

  const { data: criticalPathData } = useQuery({
    queryKey: ['trace-critical-path', traceId],
    queryFn: () => tracesService.getCriticalPath(traceId),
    enabled,
  });

  const { data: errorPathData } = useQuery({
    queryKey: ['trace-error-path', traceId],
    queryFn: () => tracesService.getErrorPath(traceId),
    enabled,
  });

  const { data: spanKindData } = useQuery({
    queryKey: ['trace-span-kind-breakdown', traceId],
    queryFn: () => tracesService.getSpanKindBreakdown(traceId),
    enabled,
  });

  const { data: spanEventsData } = useQuery({
    queryKey: ['trace-span-events', traceId],
    queryFn: () => tracesService.getSpanEvents(traceId),
    enabled,
  });

  const { data: spanSelfTimesData } = useQuery({
    queryKey: ['trace-span-self-times', traceId],
    queryFn: () => tracesService.getSpanSelfTimes(traceId),
    enabled,
  });

  const { data: relatedTracesData } = useQuery({
    queryKey: ['trace-related', traceId, relatedContext?.service_name, relatedContext?.operation_name, startMs, endMs],
    queryFn: () =>
      tracesService.getRelatedTraces(
        traceId,
        relatedContext?.service_name,
        relatedContext?.operation_name,
        startMs,
        endMs,
      ),
    enabled: enabled && !!relatedContext?.service_name && !!relatedContext?.operation_name,
  });

  const { data: spanAttributesData, isLoading: spanAttributesLoading } = useQuery({
    queryKey: ['span-attributes', traceId, selectedSpanId],
    queryFn: () => tracesService.getSpanAttributes(traceId, selectedSpanId!),
    enabled: !!selectedSpanId,
  });

  const criticalPathSpanIds = useMemo<Set<string>>(() => {
    const arr = Array.isArray(criticalPathData)
      ? criticalPathData.map((item) => {
          const row = asRecord(item);
          return {
            spanId: toStringValue(row.span_id),
            operationName: toStringValue(row.operation_name),
            serviceName: toStringValue(row.service_name),
            durationMs: toNumber(row.duration_ms),
          } satisfies CriticalPathSpan;
        })
      : [];
    return new Set(arr.map((s) => s.spanId));
  }, [criticalPathData]);

  const errorPathSpanIds = useMemo<Set<string>>(() => {
    const arr = Array.isArray(errorPathData)
      ? errorPathData.map((item) => {
          const row = asRecord(item);
          return {
            spanId: toStringValue(row.span_id),
            parentSpanId: toStringValue(row.parent_span_id),
            operationName: toStringValue(row.operation_name),
            serviceName: toStringValue(row.service_name),
            status: toStringValue(row.status),
            statusMessage: toStringValue(row.status_message),
            startTime: toStringValue(row.start_time),
            durationMs: toNumber(row.duration_ms),
          } satisfies ErrorPathSpan;
        })
      : [];
    return new Set(arr.map((s) => s.spanId));
  }, [errorPathData]);

  const spanKindBreakdown = useMemo<SpanKindDuration[]>(
    () =>
      Array.isArray(spanKindData)
        ? spanKindData.map((item) => {
            const row = asRecord(item);
            return {
              spanKind: toStringValue(row.span_kind),
              totalDurationMs: toNumber(row.total_duration_ms),
              spanCount: toNumber(row.span_count),
              pctOfTrace: toNumber(row.pct_of_trace),
            };
          })
        : [],
    [spanKindData],
  );

  const spanEvents = useMemo<SpanEvent[]>(
    () =>
      Array.isArray(spanEventsData)
        ? spanEventsData.map((item) => {
            const row = asRecord(item);
            return {
              spanId: toStringValue(row.span_id),
              traceId: toStringValue(row.trace_id),
              eventName: toStringValue(row.event_name),
              timestamp: toStringValue(row.timestamp),
              attributes: toStringValue(row.attributes),
            };
          })
        : [],
    [spanEventsData],
  );

  const spanSelfTimes = useMemo<SpanSelfTime[]>(
    () =>
      Array.isArray(spanSelfTimesData)
        ? spanSelfTimesData.map((item) => {
            const row = asRecord(item);
            return {
              spanId: toStringValue(row.span_id),
              operationName: toStringValue(row.operation_name),
              totalDurationMs: toNumber(row.total_duration_ms),
              selfTimeMs: toNumber(row.self_time_ms),
              childTimeMs: toNumber(row.child_time_ms),
            };
          })
        : [],
    [spanSelfTimesData],
  );

  const relatedTraces = useMemo<RelatedTrace[]>(
    () =>
      Array.isArray(relatedTracesData)
        ? relatedTracesData.map((item) => {
            const row = asRecord(item);
            return {
              traceId: toStringValue(row.trace_id),
              spanId: toStringValue(row.span_id),
              operationName: toStringValue(row.operation_name),
              serviceName: toStringValue(row.service_name),
              durationMs: toNumber(row.duration_ms),
              status: toStringValue(row.status),
              startTime: toStringValue(row.start_time),
            };
          })
        : [],
    [relatedTracesData],
  );

  const spanAttributes = useMemo<SpanAttributes | null>(
    () => {
      const row = asRecord(spanAttributesData);
      if (!Object.keys(row).length) return null;
      return {
        spanId: toStringValue(row.span_id),
        traceId: toStringValue(row.trace_id),
        operationName: toStringValue(row.operation_name),
        serviceName: toStringValue(row.service_name),
        attributesString: (row.attributes_string as Record<string, string> | undefined) ?? {},
        resourceAttributes: (row.resource_attributes as Record<string, string> | undefined) ?? {},
        exceptionType: toStringValue(row.exception_type),
        exceptionMessage: toStringValue(row.exception_message),
        exceptionStacktrace: toStringValue(row.exception_stacktrace),
        dbSystem: toStringValue(row.db_system),
        dbName: toStringValue(row.db_name),
        dbStatement: toStringValue(row.db_statement),
        dbStatementNormalized: toStringValue(row.db_statement_normalized),
        attributes: (row.attributes as Record<string, string> | undefined) ?? {},
      };
    },
    [spanAttributesData],
  );

  return {
    criticalPathSpanIds,
    errorPathSpanIds,
    spanKindBreakdown,
    spanEvents,
    spanSelfTimes,
    relatedTraces,
    spanAttributes,
    spanAttributesLoading,
  };
}
