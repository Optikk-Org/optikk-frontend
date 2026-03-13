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

export function useTraceDetailEnhanced(traceId: string, selectedSpanId: string | null, startMs?: number, endMs?: number) {
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
    queryKey: ['trace-related', traceId, startMs, endMs],
    queryFn: () => tracesService.getRelatedTraces(traceId, startMs, endMs),
    enabled,
  });

  const { data: spanAttributesData, isLoading: spanAttributesLoading } = useQuery({
    queryKey: ['span-attributes', traceId, selectedSpanId],
    queryFn: () => tracesService.getSpanAttributes(traceId, selectedSpanId!),
    enabled: !!selectedSpanId,
  });

  const criticalPathSpanIds = useMemo<Set<string>>(() => {
    const arr = Array.isArray(criticalPathData) ? (criticalPathData as CriticalPathSpan[]) : [];
    return new Set(arr.map((s) => s.spanId));
  }, [criticalPathData]);

  const errorPathSpanIds = useMemo<Set<string>>(() => {
    const arr = Array.isArray(errorPathData) ? (errorPathData as ErrorPathSpan[]) : [];
    return new Set(arr.map((s) => s.spanId));
  }, [errorPathData]);

  const spanKindBreakdown = useMemo<SpanKindDuration[]>(
    () => (Array.isArray(spanKindData) ? (spanKindData as SpanKindDuration[]) : []),
    [spanKindData],
  );

  const spanEvents = useMemo<SpanEvent[]>(
    () => (Array.isArray(spanEventsData) ? (spanEventsData as SpanEvent[]) : []),
    [spanEventsData],
  );

  const spanSelfTimes = useMemo<SpanSelfTime[]>(
    () => (Array.isArray(spanSelfTimesData) ? (spanSelfTimesData as SpanSelfTime[]) : []),
    [spanSelfTimesData],
  );

  const relatedTraces = useMemo<RelatedTrace[]>(
    () => (Array.isArray(relatedTracesData) ? (relatedTracesData as RelatedTrace[]) : []),
    [relatedTracesData],
  );

  const spanAttributes = useMemo<SpanAttributes | null>(
    () => (spanAttributesData && typeof spanAttributesData === 'object' ? (spanAttributesData as SpanAttributes) : null),
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
