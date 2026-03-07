import { Skeleton } from 'antd';
import { Activity, GitBranch, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

import { useTimeRangeQuery } from '@/hooks/useTimeRangeQuery';
import { metricsService } from '@/services/metricsService';
import { ROUTES } from '@/shared/constants/routes';
import './UnifiedSignalPanel.css';

function SignalColumn({
  icon,
  title,
  href,
  loading,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  href: string;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="usp__col">
      <div className="usp__col-header">
        <span className="usp__col-icon">{icon}</span>
        <span className="usp__col-title">{title}</span>
        <Link to={href} className="usp__col-link">View all →</Link>
      </div>
      <div className="usp__col-body">
        {loading ? <Skeleton active paragraph={{ rows: 2 }} /> : children}
      </div>
    </div>
  );
}

export default function UnifiedSignalPanel() {
  const { data: serviceMetrics, isLoading } = useTimeRangeQuery(
    'unified-panel-metrics',
    async (_teamId, startTime, endTime) => {
      const metrics = await metricsService.getServiceMetrics(_teamId, startTime, endTime);
      return metrics;
    },
    { staleTime: 30_000 },
  );

  const totalRps = serviceMetrics?.reduce((acc, s) => acc + s.requestCount, 0) ?? 0;
  const avgErrorPct =
    serviceMetrics && serviceMetrics.length > 0
      ? serviceMetrics.reduce((acc, s) => acc + s.errorRate, 0) / serviceMetrics.length
      : 0;
  const avgP95 =
    serviceMetrics && serviceMetrics.length > 0
      ? serviceMetrics.reduce((acc, s) => acc + s.p95Latency, 0) / serviceMetrics.length
      : 0;

  const sparkData = serviceMetrics?.map((s, i) => ({
    i,
    rps: s.requestCount,
    errPct: s.errorRate,
  })) ?? [];

  return (
    <div className="usp">
      <SignalColumn
        icon={<Activity size={13} />}
        title="Metrics"
        href={ROUTES.metrics}
        loading={isLoading}
      >
        <div className="usp__stats-row">
          <div className="usp__stat">
            <span className="usp__stat-value">{totalRps.toLocaleString()}</span>
            <span className="usp__stat-label">total requests</span>
          </div>
          <div className="usp__stat">
            <span
              className="usp__stat-value"
              style={{ color: avgErrorPct >= 5 ? 'var(--color-critical)' : avgErrorPct >= 1 ? 'var(--color-degraded)' : 'var(--text-numeric)' }}
            >
              {avgErrorPct.toFixed(2)}%
            </span>
            <span className="usp__stat-label">avg error rate</span>
          </div>
          <div className="usp__stat">
            <span className="usp__stat-value">{avgP95.toFixed(0)}ms</span>
            <span className="usp__stat-label">avg p95</span>
          </div>
        </div>
        {sparkData.length > 1 && (
          <div className="usp__chart">
            <ResponsiveContainer width="100%" height={48}>
              <AreaChart data={sparkData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                <Area
                  type="monotone"
                  dataKey="errPct"
                  stroke="var(--color-critical)"
                  strokeWidth={1}
                  fill="var(--color-critical)"
                  fillOpacity={0.10}
                  dot={false}
                  isAnimationActive={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 6,
                    fontSize: 11,
                  }}
                  formatter={(v: number) => [`${v.toFixed(2)}%`, 'Error rate']}
                  labelFormatter={() => ''}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </SignalColumn>

      <div className="usp__divider" />

      <SignalColumn
        icon={<GitBranch size={13} />}
        title="Traces"
        href={ROUTES.traces}
        loading={isLoading}
      >
        <div className="usp__stats-row">
          <div className="usp__stat">
            <span className="usp__stat-value">{serviceMetrics?.length ?? 0}</span>
            <span className="usp__stat-label">services traced</span>
          </div>
          <div className="usp__stat">
            <span className="usp__stat-value">
              {serviceMetrics?.filter((s) => s.errorRate > 0).length ?? 0}
            </span>
            <span className="usp__stat-label">with errors</span>
          </div>
        </div>
      </SignalColumn>

      <div className="usp__divider" />

      <SignalColumn
        icon={<FileText size={13} />}
        title="Logs"
        href={ROUTES.logs ?? '/logs'}
        loading={false}
      >
        <p className="usp__logs-hint">
          Live log stream available in the Logs view.
        </p>
      </SignalColumn>
    </div>
  );
}
