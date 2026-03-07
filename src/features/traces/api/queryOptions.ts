import { queryOptions } from '@tanstack/react-query';
import { tracesApi, type TracesBackendParams } from './tracesApi';
import type { RequestTime } from '@shared/api/service-types';

export const tracesKeys = {
  all: ['traces'] as const,
  lists: () => [...tracesKeys.all, 'list'] as const,
  list: (teamId: number | null, startTime: RequestTime, endTime: RequestTime, params: TracesBackendParams) =>
    [...tracesKeys.lists(), { teamId, startTime, endTime, ...params }] as const,
  details: () => [...tracesKeys.all, 'detail'] as const,
  detail: (teamId: number | null, traceId: string) => [...tracesKeys.details(), { teamId, traceId }] as const,
};

export const traceQueries = {
  list: (teamId: number | null, startTime: RequestTime, endTime: RequestTime, params: TracesBackendParams) =>
    queryOptions({
      queryKey: tracesKeys.list(teamId, startTime, endTime, params),
      queryFn: () => tracesApi.getTraces(teamId, startTime, endTime, params),
      enabled: !!teamId,
      staleTime: 30000,
    }),

  detail: (teamId: number | null, traceId: string) =>
    queryOptions({
      queryKey: tracesKeys.detail(teamId, traceId),
      queryFn: () => tracesApi.getTraceSpans(teamId, traceId),
      enabled: !!teamId && !!traceId,
      staleTime: 60000,
    }),
};
