import { Skeleton, Surface } from '@/components/ui';
import { cn } from '@/lib/utils';

import HealthRing, { type HealthStatus } from '../HealthRing';

/**
 *
 */
export interface ServiceHealthSummary {
  name: string;
  status: HealthStatus;
  rps?: number;
  errorPct?: number;
  p95Ms?: number;
}

interface HealthSnapshotStripProps {
  services: ServiceHealthSummary[];
  onServiceClick?: (serviceName: string) => void;
  loading?: boolean;
}

export default function HealthSnapshotStrip({
  services,
  onServiceClick,
  loading = false,
}: HealthSnapshotStripProps) {
  const healthy = services.filter((s) => s.status === 'healthy').length;
  const degraded = services.filter((s) => s.status === 'degraded').length;
  const critical = services.filter((s) => s.status === 'critical').length;

  if (loading) {
    return (
      <Surface elevation={1} padding="sm" className="flex items-center gap-4 mb-[var(--space-section-gap,20px)] min-h-[80px]">
        <Skeleton count={1} />
      </Surface>
    );
  }

  if (services.length === 0) return null;

  return (
    <Surface elevation={1} padding="sm" className="flex items-center gap-4 mb-[var(--space-section-gap,20px)]">
      {/* Rings — horizontally scrollable, hides scrollbar */}
      <div className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {services.map((svc) => (
          <HealthRing
            key={svc.name}
            serviceName={svc.name}
            status={svc.status}
            rps={svc.rps}
            errorPct={svc.errorPct}
            p95Ms={svc.p95Ms}
            onClick={onServiceClick}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-shrink-0 pl-4 border-l border-[var(--border-light)]">
        {healthy > 0 && (
          <span className="text-[11px] font-medium whitespace-nowrap text-[color:var(--color-healthy)]">
            {healthy} healthy
          </span>
        )}
        {degraded > 0 && (
          <span className="text-[11px] font-medium whitespace-nowrap text-[color:var(--color-degraded)]">
            {degraded} degraded
          </span>
        )}
        {critical > 0 && (
          <span className="text-[11px] font-semibold whitespace-nowrap text-[color:var(--color-critical)]">
            {critical} critical
          </span>
        )}
      </div>
    </Surface>
  );
}
