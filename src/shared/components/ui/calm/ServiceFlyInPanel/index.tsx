import { Badge, Skeleton } from '@/components/ui';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import SparklineChart from '@shared/components/ui/charts/micro/SparklineChart';

import { APP_COLORS } from '@config/colorLiterals';

import type { HealthStatus } from '../HealthRing';

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
    <div className="fixed top-0 right-0 w-[400px] h-full z-[1000] overflow-auto bg-[var(--bg-card,#fff)] shadow-lg">
      {serviceName && (
        <div className="flex flex-col h-full p-6 gap-6">
          {/* Header */}
          <div className="flex flex-col gap-2 pb-5 border-b border-[var(--border-light)]">
            <div className="flex items-center gap-2.5">
              <span className="text-[var(--text-lg,19px)] font-semibold text-[color:var(--text-primary)]">
                {serviceName}
              </span>
              {snapshot && <Badge variant={STATUS_COLOR[snapshot.status] as any} />}
            </div>
            <button
              className="inline-flex items-center gap-1 bg-transparent border-0 cursor-pointer text-[var(--text-xs,11px)] text-[color:var(--color-primary)] p-0 underline underline-offset-2"
              onClick={handleViewFull}
            >
              View full detail
              <ArrowUpRight size={12} />
            </button>
            <button
              className="absolute top-3 right-3 bg-transparent border-0 cursor-pointer text-[18px]"
              onClick={onClose}
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          {loading || !snapshot ? (
            <div className="py-2">
              <Skeleton count={4} />
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <span className="text-[var(--label-size,11px)] font-[var(--label-weight,500)] text-[color:var(--text-label)] uppercase tracking-[0.4px]">
                  Requests / s
                </span>
                <SparklineChart
                  data={snapshot.rps}
                  color={APP_COLORS.hex_7c7ff2}
                  fill={false}
                  width={280}
                  height={40}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[var(--label-size,11px)] font-[var(--label-weight,500)] text-[color:var(--text-label)] uppercase tracking-[0.4px]">
                  Error rate %
                </span>
                <SparklineChart
                  data={snapshot.errorRate}
                  color={APP_COLORS.hex_dc2626}
                  fill={false}
                  width={280}
                  height={40}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[var(--label-size,11px)] font-[var(--label-weight,500)] text-[color:var(--text-label)] uppercase tracking-[0.4px]">
                  p95 latency ms
                </span>
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
