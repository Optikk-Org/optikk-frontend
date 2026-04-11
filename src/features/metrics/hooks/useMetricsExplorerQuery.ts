import { useQuery } from "@tanstack/react-query";

import { resolveTimeBounds } from "@/features/explorer-core/utils/timeRange";
import { timeRangeQuerySegment } from "@/types";
import { useTeamId, useTimeRange } from "@store/appStore";
import { buildExplorerQueryRequest, metricsExplorerApi } from "../api/metricsExplorerApi";
import type { MetricQueryDefinition, MetricSpaceAggregation, TimeStep } from "../types";

export function useMetricsExplorerQuery(
  queries: MetricQueryDefinition[],
  step: TimeStep,
  spaceAgg: MetricSpaceAggregation
) {
  const selectedTeamId = useTeamId();
  const timeRange = useTimeRange();

  const activeQueries = queries.filter((q) => q.metricName);
  const queriesHash = JSON.stringify(activeQueries);

  return useQuery({
    queryKey: [
      "metrics",
      "explorer",
      selectedTeamId,
      queriesHash,
      timeRangeQuerySegment(timeRange),
      step,
      spaceAgg,
    ],
    queryFn: () => {
      const { startTime, endTime } = resolveTimeBounds(timeRange);
      return metricsExplorerApi.query(
        buildExplorerQueryRequest(queries, startTime, endTime, step, spaceAgg)
      );
    },
    enabled: Boolean(selectedTeamId) && activeQueries.length > 0,
    placeholderData: (previous) => previous,
    retry: false,
  });
}
