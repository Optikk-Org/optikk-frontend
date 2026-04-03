import { useQuery } from '@tanstack/react-query';

import { useAppStore } from '@app/store/appStore';
import { resolveTimeBounds } from '@/features/explorer-core/utils/timeRange';
import { metricsExplorerApi } from '../api/metricsExplorerApi';

export function useMetricNames(search: string) {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const { startTime, endTime } = resolveTimeBounds(timeRange);

  return useQuery({
    queryKey: ['metrics', 'names', selectedTeamId, startTime, endTime, search, refreshKey],
    queryFn: () => metricsExplorerApi.fetchMetricNames({ startTime, endTime, search }),
    enabled: Boolean(selectedTeamId),
    placeholderData: (previous) => previous,
    staleTime: 60_000,
  });
}
