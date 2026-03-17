import { useQuery } from '@tanstack/react-query';

import { tracesService } from '@shared/api/tracesService';

import type { TraceComparisonResult } from '../types';

export function useTraceComparison(traceA: string, traceB: string) {
  return useQuery<TraceComparisonResult>({
    queryKey: ['trace-comparison', traceA, traceB],
    queryFn: () =>
      tracesService.getTraceComparison(traceA, traceB) as Promise<TraceComparisonResult>,
    enabled: !!traceA && !!traceB,
  });
}

export function useTraceFlamegraph(traceId: string) {
  return useQuery({
    queryKey: ['trace-flamegraph', traceId],
    queryFn: () => tracesService.getFlamegraphData(traceId),
    enabled: !!traceId,
  });
}

export function useRedMetricsSummary(startTime: number, endTime: number) {
  return useQuery({
    queryKey: ['red-metrics-summary', startTime, endTime],
    queryFn: () => tracesService.getREDSummary(startTime, endTime),
  });
}

export function useApdexScore(
  startTime: number,
  endTime: number,
  service: string,
) {
  return useQuery({
    queryKey: ['apdex-score', startTime, endTime, service],
    queryFn: () => tracesService.getApdex(startTime, endTime, service),
    enabled: !!service,
  });
}

export function useTraceActions() {
  return {
    useTraceComparison,
    useTraceFlamegraph,
    useRedMetricsSummary,
    useApdexScore,
    getLiveTailUrl: tracesService.getLiveTailUrl,
  };
}
