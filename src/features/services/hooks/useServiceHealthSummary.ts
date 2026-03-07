import { servicesPageService } from '@shared/api/servicesPageService';

import { useTimeRangeQuery } from '@shared/hooks/useTimeRangeQuery';

import { countFromSummary } from '../utils/servicesUtils';

/**
 *
 */
export function useServiceHealthSummary() {
  const { data: totalServicesRaw, isLoading: totalLoading } = useTimeRangeQuery(
    'services-summary-total',
    (teamId, startTime, endTime) => servicesPageService.getTotalServices(teamId, startTime, endTime),
  );

  const { data: healthyServicesRaw, isLoading: healthyLoading } = useTimeRangeQuery(
    'services-summary-healthy',
    (teamId, startTime, endTime) => servicesPageService.getHealthyServices(teamId, startTime, endTime),
  );

  const { data: degradedServicesRaw, isLoading: degradedLoading } = useTimeRangeQuery(
    'services-summary-degraded',
    (teamId, startTime, endTime) => servicesPageService.getDegradedServices(teamId, startTime, endTime),
  );

  const { data: unhealthyServicesRaw, isLoading: unhealthyLoading } = useTimeRangeQuery(
    'services-summary-unhealthy',
    (teamId, startTime, endTime) => servicesPageService.getUnhealthyServices(teamId, startTime, endTime),
  );

  return {
    totalServices: countFromSummary(totalServicesRaw),
    healthyServices: countFromSummary(healthyServicesRaw),
    degradedServices: countFromSummary(degradedServicesRaw),
    unhealthyServices: countFromSummary(unhealthyServicesRaw),
    isLoading: totalLoading || healthyLoading || degradedLoading || unhealthyLoading,
  };
}
