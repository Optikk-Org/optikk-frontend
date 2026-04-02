import { useQuery } from '@tanstack/react-query';

import { useAppStore } from '@app/store/appStore';
import { resolveTimeBounds } from '@/features/explorer-core/utils/timeRange';
import { metricsExplorerApi } from '../api/metricsExplorerApi';

export function useMetricTags(metricName: string) {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const { startTime, endTime } = resolveTimeBounds(timeRange);

  return useQuery({
    queryKey: ['metrics', 'tags', selectedTeamId, metricName, startTime, endTime, refreshKey],
    queryFn: () => metricsExplorerApi.fetchMetricTags({ metricName, startTime, endTime }),
    enabled: Boolean(selectedTeamId) && Boolean(metricName),
    placeholderData: (previous) => previous,
    staleTime: 60_000,
  });
}
