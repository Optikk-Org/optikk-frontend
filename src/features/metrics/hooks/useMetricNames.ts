import { useQuery } from "@tanstack/react-query";

import { resolveTimeBounds } from "@/features/explorer-core/utils/timeRange";
import { timeRangeQuerySegment } from "@/types";
import { useTeamId, useTimeRange } from "@store/appStore";
import { metricsExplorerApi } from "../api/metricsExplorerApi";

export function useMetricNames(search: string) {
  const selectedTeamId = useTeamId();
  const timeRange = useTimeRange();

  return useQuery({
    queryKey: ["metrics", "names", selectedTeamId, timeRangeQuerySegment(timeRange), search],
    queryFn: () => {
      const { startTime, endTime } = resolveTimeBounds(timeRange);
      return metricsExplorerApi.fetchMetricNames({ startTime, endTime, search });
    },
    enabled: Boolean(selectedTeamId),
    placeholderData: (previous) => previous,
    staleTime: 60_000,
  });
}
