import { Activity, AlertCircle, Clock, Zap } from 'lucide-react';

import StatCard from '@shared/components/ui/cards/StatCard';

import { formatDuration, formatNumber } from '@shared/utils/formatters';

import { APP_COLORS } from '@config/colorLiterals';

interface ServiceStats {
  totalRequests: number;
}

interface ServiceDetailStatsRowProps {
  stats: ServiceStats;
  errorRate: number;
  avgLatency: number;
  p95Latency: number;
  requestsSparkline: number[];
  errorSparkline: number[];
}

/**
 * KPI stats row shown above service detail tabs.
 */
export default function ServiceDetailStatsRow({
  stats,
  errorRate,
  avgLatency,
  p95Latency,
  requestsSparkline,
  errorSparkline,
}: ServiceDetailStatsRowProps): JSX.Element {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 16,
        marginBottom: 24,
      }}
    >
      <StatCard
        metric={{
          title: 'Total Requests',
          value: stats.totalRequests,
          formatter: formatNumber,
        }}
        trend={{ value: 0 }}
        visuals={{
          icon: <Activity size={20} />,
          iconColor: APP_COLORS.hex_1890ff,
          sparklineData: requestsSparkline,
          sparklineColor: APP_COLORS.hex_1890ff,
        }}
      />
      <StatCard
        metric={{
          title: 'Error Rate',
          value: errorRate,
          formatter: (val: string | number) => `${formatNumber(Number(val))}%`,
        }}
        trend={{ value: 0 }}
        visuals={{
          icon: <AlertCircle size={20} />,
          iconColor:
            errorRate > 5
              ? APP_COLORS.hex_f04438
              : errorRate > 1
                ? APP_COLORS.hex_f79009
                : APP_COLORS.hex_12b76a,
          sparklineData: errorSparkline,
          sparklineColor: APP_COLORS.hex_f04438,
        }}
      />
      <StatCard
        metric={{
          title: 'Avg Latency',
          value: avgLatency,
          formatter: formatDuration,
        }}
        trend={{ value: 0 }}
        visuals={{
          icon: <Clock size={20} />,
          iconColor: APP_COLORS.hex_722ed1,
        }}
      />
      <StatCard
        metric={{
          title: 'P95 Latency',
          value: p95Latency,
          formatter: formatDuration,
        }}
        trend={{ value: 0 }}
        visuals={{
          icon: <Zap size={20} />,
          iconColor: APP_COLORS.hex_fa8c16,
        }}
      />
    </div>
  );
}
