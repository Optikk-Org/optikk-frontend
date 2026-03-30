import { Surface } from '@/components/ui';

import { formatNumber, formatDuration } from '@shared/utils/formatters';

import { APP_COLORS } from '@config/colorLiterals';

import type { ServiceMetricPoint } from '../types';

interface ServiceMetricsGridProps {
  serviceMetrics: ServiceMetricPoint[];
  onServiceSelect: (serviceName: string) => void;
}

/**
 *
 */
export function ServiceMetricsGrid({ serviceMetrics, onServiceSelect }: ServiceMetricsGridProps) {
  if (serviceMetrics.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 16,
      }}
    >
      {serviceMetrics.slice(0, 12).map((service) => {
        const errorRate =
          service.request_count > 0 ? (service.error_count / service.request_count) * 100 : 0;

        return (
          <div key={service.service_name}>
            <Surface
              elevation={1}
              padding="md"
              className="chart-card"
              style={{ cursor: 'pointer' }}
              onClick={() => onServiceSelect(service.service_name)}
            >
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                  {service.service_name}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    marginBottom: 4,
                  }}
                >
                  <span>Requests</span>
                  <span>{formatNumber(service.request_count)}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    marginBottom: 8,
                  }}
                >
                  <span>Error Rate</span>
                  <span
                    style={{
                      color:
                        errorRate > 5
                          ? APP_COLORS.hex_f04438
                          : errorRate > 1
                            ? APP_COLORS.hex_f79009
                            : APP_COLORS.hex_73c991,
                    }}
                  >
                    {errorRate.toFixed(2)}%
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    background: 'var(--bg-tertiary, #2d2d2d)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(errorRate, 100)}%`,
                      height: '100%',
                      background:
                        errorRate > 5
                          ? APP_COLORS.hex_f04438
                          : errorRate > 1
                            ? APP_COLORS.hex_f79009
                            : APP_COLORS.hex_73c991,
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                }}
              >
                <span>Avg: {formatDuration(service.avg_latency)}</span>
                <span>P95: {formatDuration(service.p95_latency)}</span>
              </div>
            </Surface>
          </div>
        );
      })}
    </div>
  );
}
