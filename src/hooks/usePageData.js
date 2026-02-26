import { useMemo } from 'react';
import { useTimeRangeQuery } from './useTimeRangeQuery';
import { useDashboardConfig } from './useDashboardConfig';

/**
 * Custom hook for common page data fetching patterns
 * Follows DRY principle - combines dashboard config and chart data sources
 * 
 * @param {string} pageKey - The page key for dashboard config
 * @param {Object} dataQueries - Object mapping data source keys to query functions
 * @returns {Object} Dashboard config and chart data sources
 * 
 * @example
 * const { dashboardConfig, chartDataSources, isLoading } = usePageData('traces', {
 *   'metrics-timeseries': (teamId, start, end) => v1Service.getMetricsTimeSeries(teamId, start, end),
 *   'endpoints-timeseries': (teamId, start, end) => v1Service.getEndpointTimeSeries(teamId, start, end)
 * });
 */
export function usePageData(pageKey, dataQueries = {}) {
  const { config: dashboardConfig } = useDashboardConfig(pageKey);

  // Fetch all data sources
  const queryResults = {};
  const loadingStates = {};

  Object.entries(dataQueries).forEach(([key, queryFn]) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data, isLoading } = useTimeRangeQuery(`${pageKey}-${key}`, queryFn);
    queryResults[key] = data;
    loadingStates[key] = isLoading;
  });

  const chartDataSources = useMemo(() => {
    const sources = {};
    Object.entries(queryResults).forEach(([key, data]) => {
      sources[key] = Array.isArray(data) ? data : [];
    });
    return sources;
  }, [queryResults]);

  const isLoading = Object.values(loadingStates).some(loading => loading);

  return {
    dashboardConfig,
    chartDataSources,
    isLoading,
  };
}

