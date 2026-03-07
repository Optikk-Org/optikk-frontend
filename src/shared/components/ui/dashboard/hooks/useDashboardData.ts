import { useMemo } from 'react';

import type { DashboardComponentSpec, DashboardDataSources } from '@/types/dashboardConfig';

import { resolveDataSourceId } from '../utils/dashboardUtils';

/**
 *
 */
export function useDashboardData(
  chartConfig: DashboardComponentSpec,
  dataSources: DashboardDataSources,
) {
  const rawData = dataSources?.[resolveDataSourceId(chartConfig)];
  const data = useMemo(() => {
    const key = chartConfig.dataKey;
    const arr = key ? rawData?.[key] : rawData;
    return Array.isArray(arr) ? arr : [];
  }, [rawData, chartConfig.dataKey]);

  return { rawData, data };
}
