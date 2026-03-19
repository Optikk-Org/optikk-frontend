import { Skeleton, Surface } from '@shared/design-system';
import { Activity, AlertCircle, Clock, Server, Zap } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  normalizeTimeSeriesPoint,
  normalizeServiceMetric,
  normalizeEndpointMetric,
} from '@features/metrics/utils/metricNormalizers';

import { PageHeader, StatCardsGrid, HealthIndicator } from '@shared/components/ui';
import ConfigurableDashboard from '@shared/components/ui/dashboard/ConfigurableDashboard';

import { metricsService } from '@shared/api/metricsService';

import { useDashboardConfig } from '@shared/hooks/useDashboardConfig';
import { useTimeRangeQuery } from '@shared/hooks/useTimeRangeQuery';

import { formatNumber, formatDuration } from '@shared/utils/formatters';

import { APP_COLORS } from '@config/colorLiterals';
import { buildOverviewSparklines, buildOverviewSummary } from './summary';
import './OverviewPage.css';

/**
 *
 */
export default function OverviewPage() {
  const navigate = useNavigate();
  const { config } = useDashboardConfig('overview');

  // Metrics timeseries for charts
  const { data: timeseriesRaw, isLoading: timeseriesLoading, error: timeseriesError } = useTimeRangeQuery(
    'metrics-timeseries',
    (teamId, start, end) => metricsService.getMetricsTimeSeries(teamId, start, end, undefined, '5m'),
  );

  // Per-endpoint timeseries from backend
  const { data: endpointTimeseriesRaw } = useTimeRangeQuery(
    'endpoints-timeseries',
    (teamId, start, end) => metricsService.getOverviewEndpointTimeSeries(teamId, start, end),
  );

  // Service metrics for health grid
  const { data: servicesRaw, isLoading: servicesLoading, error: servicesError } = useTimeRangeQuery(
    'services-metrics',
    (teamId, startTime, endTime) => metricsService.getOverviewServices(teamId, startTime, endTime),
  );

  // Endpoint metrics for breakdown lists below charts
  const { data: endpointMetricsRaw } = useTimeRangeQuery(
    'endpoints-metrics',
    (teamId, startTime, endTime) => metricsService.getOverviewEndpointMetrics(teamId, startTime, endTime),
  );

  // === Normalize data shapes ===
  const timeseries = useMemo(() => {
    if (!timeseriesRaw) return [];
    return Array.isArray(timeseriesRaw) ? timeseriesRaw.map(normalizeTimeSeriesPoint) : [];
  }, [timeseriesRaw]);

  // Build sparkline data from timeseries
  // Services
  const services = useMemo(() => {
    if (!servicesRaw) return [];
    return Array.isArray(servicesRaw) ? servicesRaw.map(normalizeServiceMetric) : [];
  }, [servicesRaw]);

  const summary = useMemo(() => buildOverviewSummary(services), [services]);
  const sparklines = useMemo(() => buildOverviewSparklines(timeseries), [timeseries]);
  const summaryLoading = servicesLoading;
  const summaryError = servicesError ?? timeseriesError;

  // Compute SLO metrics
  const sloMetrics = useMemo(() => {
    const errorRate = (summary).error_rate || 0;
    const availability = Math.max(0, 100 - errorRate);
    const p95 = (summary).p95_latency || 0;
    const p95Target = 500;
    const p95Score = p95 > 0 ? Math.min(100, (p95Target / p95) * 100) : 100;
    const errorBudget = Math.max(0, (0.1 - errorRate / 100) / 0.1 * 100);
    return { availability, p95Score, errorBudget };
  }, [summary]);

  // Service health grid data
  const serviceHealth = useMemo(() => {
    return services.slice(0, 8).map((s) => {
      const requestCount = Number(s.request_count || 0);
      const errorCount = Number(s.error_count || 0);
      const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;
      const status = errorRate > 5 ? 'unhealthy' : errorRate > 1 ? 'degraded' : 'healthy';
      return { name: s.service_name, status, requestCount, errorRate, avgLatency: Number(s.avg_latency || 0) };
    });
  }, [services]);

  // Data sources for ConfigurableDashboard
  const dataSources = useMemo(() => ({
    'metrics-summary': summary,
    'metrics-timeseries': timeseries,
    'endpoints-timeseries': Array.isArray(endpointTimeseriesRaw) ? endpointTimeseriesRaw.map(normalizeTimeSeriesPoint) : [],
    'endpoints-metrics': Array.isArray(endpointMetricsRaw) ? endpointMetricsRaw.map(normalizeEndpointMetric) : [],
  }), [summary, timeseries, endpointTimeseriesRaw, endpointMetricsRaw]);

  if (summaryLoading && timeseries.length === 0) {
    return (
      <div className="overview-page">
        <PageHeader title="Overview" subtitle="Monitor your system health" icon={<Activity size={24} />} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <Surface elevation={1} padding="md" key={i}><Skeleton /></Surface>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <Surface elevation={1} padding="md"><Skeleton /></Surface>
          <Surface elevation={1} padding="md"><Skeleton /></Surface>
        </div>
      </div>
    );
  }

  if (summaryError && timeseries.length === 0) {
    return (
      <div className="page-error">
        <div className="text-muted" style={{textAlign:'center',padding:32}}>{summaryError.message || 'Failed to load overview data'}</div>
      </div>
    );
  }

  return (
    <div className="overview-page">
      <PageHeader
        title="Overview"
        subtitle="Monitor your system health"
        icon={<Activity size={24} />}
      />

      {/* Key Metrics with Sparklines */}
      <StatCardsGrid
        style={{ marginBottom: 24 }}
        className="overview-stats-grid"
        stats={[
          {
            metric: {
              title: 'Total Requests',
              value: (summary).total_requests || 0,
              formatter: formatNumber,
            },
            trend: { value: 0 },
            visuals: {
              icon: <Activity size={20} />,
              iconColor: APP_COLORS.hex_5e60ce,
              loading: summaryLoading,
              sparklineData: sparklines.requests,
              sparklineColor: APP_COLORS.hex_5e60ce,
            },
          },
          {
            metric: {
              title: 'Error Rate',
              value: Number(Math.max(0, (summary).error_rate || 0).toFixed(2)),
              suffix: '%',
            },
            trend: { value: 0, inverted: true },
            visuals: {
              icon: <AlertCircle size={20} />,
              iconColor: APP_COLORS.hex_f04438,
              loading: summaryLoading,
              sparklineData: sparklines.errors,
              sparklineColor: APP_COLORS.hex_f04438,
            },
          },
          {
            metric: {
              title: 'Avg Latency',
              value: (summary).avg_latency || 0,
              formatter: formatDuration,
            },
            trend: { value: 0, inverted: true },
            visuals: {
              icon: <Clock size={20} />,
              iconColor: APP_COLORS.hex_f79009,
              loading: summaryLoading,
              sparklineData: sparklines.latency,
              sparklineColor: APP_COLORS.hex_f79009,
            },
          },
          {
            metric: {
              title: 'P95 Latency',
              value: (summary).p95_latency || 0,
              formatter: formatDuration,
            },
            trend: { value: 0, inverted: true },
            visuals: {
              icon: <Zap size={20} />,
              iconColor: APP_COLORS.hex_06aed5,
              loading: summaryLoading,
            },
          },
        ]}
      />

      {/* SLO Indicators */}
      <div style={{ marginTop: 16 }}>
        <Surface elevation={1} padding="md" className="chart-card">
          <h4>SLO Indicators</h4>
          <div className="slo-row">
            <div className="slo-item">
              <div style={{ position: 'relative', width: 80, height: 80 }}>
                <svg viewBox="0 0 80 80" width={80} height={80}>
                  <circle cx="40" cy="40" r="34" fill="none" stroke="var(--bg-tertiary, #2d2d2d)" strokeWidth="6" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke={sloMetrics.availability >= 99.9 ? APP_COLORS.hex_73c991 : sloMetrics.availability >= 99 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_f04438} strokeWidth="6" strokeDasharray={`${Number(sloMetrics.availability.toFixed(2)) / 100 * 213.6} 213.6`} strokeLinecap="round" transform="rotate(-90 40 40)" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{sloMetrics.availability.toFixed(2)}%</div>
              </div>
              <div className="slo-label">Availability</div>
              <div className="slo-target">Target: 99.9%</div>
            </div>
            <div className="slo-item">
              <div style={{ position: 'relative', width: 80, height: 80 }}>
                <svg viewBox="0 0 80 80" width={80} height={80}>
                  <circle cx="40" cy="40" r="34" fill="none" stroke="var(--bg-tertiary, #2d2d2d)" strokeWidth="6" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke={sloMetrics.p95Score >= 90 ? APP_COLORS.hex_73c991 : sloMetrics.p95Score >= 70 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_f04438} strokeWidth="6" strokeDasharray={`${Number(sloMetrics.p95Score.toFixed(0)) / 100 * 213.6} 213.6`} strokeLinecap="round" transform="rotate(-90 40 40)" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{sloMetrics.p95Score.toFixed(0)}%</div>
              </div>
              <div className="slo-label">P95 Latency</div>
              <div className="slo-target">Target: &lt;500ms</div>
            </div>
            <div className="slo-item">
              <div style={{ position: 'relative', width: 80, height: 80 }}>
                <svg viewBox="0 0 80 80" width={80} height={80}>
                  <circle cx="40" cy="40" r="34" fill="none" stroke="var(--bg-tertiary, #2d2d2d)" strokeWidth="6" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke={sloMetrics.errorBudget >= 50 ? APP_COLORS.hex_73c991 : sloMetrics.errorBudget >= 20 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_f04438} strokeWidth="6" strokeDasharray={`${Number(Math.max(0, sloMetrics.errorBudget).toFixed(0)) / 100 * 213.6} 213.6`} strokeLinecap="round" transform="rotate(-90 40 40)" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{Math.max(0, sloMetrics.errorBudget).toFixed(0)}%</div>
              </div>
              <div className="slo-label">Error Budget</div>
              <div className="slo-target">Remaining</div>
            </div>
          </div>
        </Surface>
      </div>

      {/* Charts -- driven by YAML config */}
      <div style={{ marginTop: 16 }}>
        <ConfigurableDashboard
          config={config}
          dataSources={dataSources}
          isLoading={summaryLoading}
        />
      </div>

      {/* Service Health Grid */}
      <div style={{ marginTop: 16 }}>
        <Surface elevation={1} padding="md" className="services-overview-card">
          <h4><Server style={{ marginRight: 8, verticalAlign: 'middle' }} />Services Overview</h4>
            {serviceHealth.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                {serviceHealth.map((service) => (
                  <div key={service.name}>
                    <div
                      className="service-health-card"
                      onClick={() => navigate(`/services/${encodeURIComponent(service.name)}`)}
                    >
                      <HealthIndicator status={service.status} size={8} />
                      <div className="service-health-name">{service.name}</div>
                      <div className="service-health-metric">
                        {formatNumber(service.requestCount)} req
                      </div>
                      <div
                        className={service.errorRate >= 99.5 ? 'error-badge' : 'service-health-metric'}
                        style={service.errorRate < 99.5 ? { color: service.errorRate > 1 ? APP_COLORS.hex_f04438 : 'var(--text-muted)' } : undefined}
                      >
                        {Math.max(0, Number(service.errorRate)).toFixed(2)}% err
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted" style={{textAlign:'center',padding:32}}>No services data available</div>
            )}
        </Surface>
      </div>
    </div>
  );
}
