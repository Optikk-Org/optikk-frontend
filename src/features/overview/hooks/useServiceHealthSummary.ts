import type { HealthStatus } from '@shared/components/ui/calm/HealthRing';
import type { ServiceHealthSummary } from '@shared/components/ui/calm/HealthSnapshotStrip';
import { useTimeRangeQuery } from '@/hooks/useTimeRangeQuery';
import { metricsService } from '@/services/metricsService';

function deriveStatus(errorRate: number, p95Latency: number): HealthStatus {
  if (errorRate >= 10 || p95Latency >= 5000) return 'critical';
  if (errorRate >= 2 || p95Latency >= 1000) return 'degraded';
  return 'healthy';
}

/**
 *
 */
export function useServiceHealthSummary() {
  return useTimeRangeQuery<ServiceHealthSummary[]>(
    'service-health-summary',
    async (_teamId, startTime, endTime) => {
      const metrics = await metricsService.getServiceMetrics(_teamId, startTime, endTime);
      return metrics
        .filter((m) => m.serviceName)
        .map((m) => ({
          name: m.serviceName,
          status: deriveStatus(m.errorRate, m.p95Latency),
          rps: m.requestCount > 0 ? m.requestCount / ((Number(endTime) - Number(startTime)) / 1000) : 0,
          errorPct: m.errorRate,
          p95Ms: m.p95Latency,
        }));
    },
    { staleTime: 30_000 },
  );
}
