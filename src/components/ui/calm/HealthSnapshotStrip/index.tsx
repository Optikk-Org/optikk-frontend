import { Skeleton } from 'antd';

import HealthRing, { type HealthStatus } from '../HealthRing';
import './HealthSnapshotStrip.css';

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
      <div className="health-strip health-strip--loading">
        <Skeleton active paragraph={{ rows: 1 }} />
      </div>
    );
  }

  if (services.length === 0) return null;

  return (
    <div className="health-strip">
      <div className="health-strip__rings">
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
      <div className="health-strip__legend">
        {healthy > 0 && (
          <span className="health-strip__legend-item health-strip__legend-item--healthy">
            {healthy} healthy
          </span>
        )}
        {degraded > 0 && (
          <span className="health-strip__legend-item health-strip__legend-item--degraded">
            {degraded} degraded
          </span>
        )}
        {critical > 0 && (
          <span className="health-strip__legend-item health-strip__legend-item--critical">
            {critical} critical
          </span>
        )}
      </div>
    </div>
  );
}
