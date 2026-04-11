import { useQuery } from "@tanstack/react-query";

import { resolveTimeBounds } from "@/features/explorer-core/utils/timeRange";
import { timeRangeQuerySegment } from "@/types";
import { useTeamId, useTimeRange } from "@store/appStore";
import { metricsExplorerApi } from "../api/metricsExplorerApi";

export function useMetricTags(metricName: string) {
  const selectedTeamId = useTeamId();
  const timeRange = useTimeRange();

  return useQuery({
    queryKey: ["metrics", "tags", selectedTeamId, metricName, timeRangeQuerySegment(timeRange)],
    queryFn: () => {
      const { startTime, endTime } = resolveTimeBounds(timeRange);
      return metricsExplorerApi.fetchMetricTags({ metricName, startTime, endTime });
    },
    enabled: Boolean(selectedTeamId) && Boolean(metricName),
    placeholderData: (previous) => previous,
    staleTime: 60_000,
  });
}
