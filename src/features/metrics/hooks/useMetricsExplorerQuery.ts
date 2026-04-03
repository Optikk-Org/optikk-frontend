import { useQuery } from '@tanstack/react-query';

import { useAppStore } from '@app/store/appStore';
import { resolveTimeBounds } from '@/features/explorer-core/utils/timeRange';
import { metricsExplorerApi, type MetricExplorerQueryRequest } from '../api/metricsExplorerApi';
import type { MetricQueryDefinition, MetricSpaceAggregation, TimeStep } from '../types';

function buildQueryRequest(
  queries: MetricQueryDefinition[],
  startTime: number,
  endTime: number,
  step: TimeStep,
  spaceAgg: MetricSpaceAggregation
): MetricExplorerQueryRequest {
  return {
    startTime,
    endTime,
    step,
    queries: queries
      .filter((q) => q.metricName)
      .map((q) => ({
        id: q.id,
        aggregation: q.aggregation,
        metricName: q.metricName,
        where: q.where.map((w) => ({ key: w.key, operator: w.operator, value: w.value })),
        groupBy: [...q.groupBy],
        spaceAggregation: spaceAgg,
      })),
  };
}

export function useMetricsExplorerQuery(
  queries: MetricQueryDefinition[],
  step: TimeStep,
  spaceAgg: MetricSpaceAggregation
) {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const { startTime, endTime } = resolveTimeBounds(timeRange);

  const activeQueries = queries.filter((q) => q.metricName);
  const queriesHash = JSON.stringify(activeQueries);

  return useQuery({
    queryKey: ['metrics', 'explorer', selectedTeamId, queriesHash, startTime, endTime, step, spaceAgg, refreshKey],
    queryFn: () => metricsExplorerApi.query(buildQueryRequest(queries, startTime, endTime, step, spaceAgg)),
    enabled: Boolean(selectedTeamId) && activeQueries.length > 0,
    placeholderData: (previous) => previous,
    retry: false,
  });
}
