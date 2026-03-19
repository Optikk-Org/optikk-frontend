import { Badge, Skeleton } from '@shared/design-system';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import SparklineChart from '@shared/components/ui/charts/micro/SparklineChart';

import { APP_COLORS } from '@config/colorLiterals';

import type { HealthStatus } from '../HealthRing';
import './ServiceFlyInPanel.css';

interface ServiceSnapshot {
  status: HealthStatus;
  rps: number[];
  errorRate: number[];
  p95Latency: number[];
}

interface ServiceFlyInPanelProps {
  serviceName: string | null;
  snapshot?: ServiceSnapshot;
  loading?: boolean;
  open: boolean;
  onClose: () => void;
}

const STATUS_COLOR: Record<HealthStatus, string> = {
  healthy: 'success',
  degraded: 'warning',
  critical: 'error',
  unknown: 'default',
};

export default function ServiceFlyInPanel({
  serviceName,
  snapshot,
  loading = false,
  open,
  onClose,
}: ServiceFlyInPanelProps) {
  const navigate = useNavigate();

  const handleViewFull = () => {
    if (serviceName) {
      navigate(`/services/${encodeURIComponent(serviceName)}`);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="service-fly-in-panel"
      style={{ position: 'fixed', top: 0, right: 0, width: 400, height: '100%', zIndex: 1000, background: 'var(--bg-card, #fff)', boxShadow: '-2px 0 8px rgba(0,0,0,0.12)', overflow: 'auto' }}
    >
      {serviceName && (
        <div className="sfp__content">
          <div className="sfp__header">
            <div className="sfp__title-row">
              <span className="sfp__name">{serviceName}</span>
              {snapshot && (
                <Badge variant={STATUS_COLOR[snapshot.status] as any} />
              )}
            </div>
            <button className="sfp__view-full" onClick={handleViewFull}>
              View full detail
              <ArrowUpRight size={12} />
            </button>
            <button className="sfp__close" onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>&times;</button>
          </div>

          {loading || !snapshot ? (
            <div className="sfp__loading">
              <Skeleton count={4} />
            </div>
          ) : (
            <div className="sfp__charts">
              <div className="sfp__chart-row">
                <span className="sfp__chart-label">Requests / s</span>
                <SparklineChart
                  data={snapshot.rps}
                  color={APP_COLORS.hex_7c7ff2}
                  fill={false}
                  width={280}
                  height={40}
                />
              </div>
              <div className="sfp__chart-row">
                <span className="sfp__chart-label">Error rate %</span>
                <SparklineChart
                  data={snapshot.errorRate}
                  color={APP_COLORS.hex_dc2626}
                  fill={false}
                  width={280}
                  height={40}
                />
              </div>
              <div className="sfp__chart-row">
                <span className="sfp__chart-label">p95 latency ms</span>
                <SparklineChart
                  data={snapshot.p95Latency}
                  color={APP_COLORS.hex_d97706}
                  fill={false}
                  width={280}
                  height={40}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
