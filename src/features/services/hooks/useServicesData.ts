import { useServiceHealthSummary } from './useServiceHealthSummary';
import { useServiceMetrics } from './useServiceMetrics';
import { useServiceTopology } from './useServiceTopology';

import type { ServicesDataParams, ServicesDataResult } from '../types';

/**
 *
 */
export function useServicesData(params: ServicesDataParams): ServicesDataResult {
  const healthSummary = useServiceHealthSummary();
  const metrics = useServiceMetrics(params);
  const topology = useServiceTopology({ 
    searchQuery: params.searchQuery, 
    healthFilter: params.healthFilter || 'all', 
  });

  return {
    ...healthSummary,
    ...metrics,
    ...topology,
    isLoading: 
      healthSummary.isLoading || 
      metrics.metricsLoading || 
      metrics.timeseriesLoading || 
      topology.topologyLoading,
  };
}
