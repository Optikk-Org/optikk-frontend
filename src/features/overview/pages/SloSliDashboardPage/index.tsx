import { AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { useMemo, useState } from 'react';

import { FilterBar, PageHeader } from '@shared/components/ui';
import ConfigurableDashboard from '@shared/components/ui/dashboard/ConfigurableDashboard';

import { metricsService } from '@shared/api/metricsService';

import { useDashboardConfig } from '@shared/hooks/useDashboardConfig';
import { useTimeRangeQuery } from '@shared/hooks/useTimeRangeQuery';

import { SloComplianceTable, SloHealthGauges } from '../../components';

const n = (v: any) => (v == null || Number.isNaN(Number(v)) ? 0 : Number(v));

// SLO targets — configurable via Settings > Preferences > SLO targets
// Falls back to sensible defaults when viewPreferences don't have values
import { useAppStore } from '@store/appStore';

function useSloTargets() {
  const viewPreferences = useAppStore((s) => s.viewPreferences);
  return {
    availabilityTarget: (viewPreferences?.sloAvailabilityTarget as number) ?? 99.9,
    p95TargetMs: (viewPreferences?.sloP95TargetMs as number) ?? 300,
  };
}

/**
 *
 */
export default function SloSliDashboardPage() {
  const { availabilityTarget: AVAILABILITY_TARGET, p95TargetMs: P95_TARGET_MS } = useSloTargets();
  const [selectedService, setSelectedService] = useState('');
  const { config } = useDashboardConfig('slo-sli');

  const { data: servicesData } = useTimeRangeQuery(
    'overview-services-slo',
    (teamId, start, end) => metricsService.getOverviewServices(teamId, start, end),
  );

  const services = servicesData || [];
  const serviceOptions = [
    { label: 'All Services', value: '' },
    ...(Array.isArray(services) ? services : []).map((s: any) => ({
      label: s.service_name || s.name,
      value: s.service_name || s.name,
    })),
  ];

  const { data, isLoading } = useTimeRangeQuery(
    'overview-slo-sli',
    (teamId, start, end) => metricsService.getSloSli(teamId, start, end, selectedService || undefined, '5m'),
    { extraKeys: [selectedService] },
  );

  const status: any = (data as any)?.status || {};
  const timeseries = useMemo(() =>
    Array.isArray((data as any)?.timeseries) ? (data as any).timeseries : []
    , [data]);

  const availabilityPct = n(status.availability_percent);
  const p95Ms = n(status.p95_latency_ms);
  const errorBudget = n(status.error_budget_remaining_percent);
  const isCompliant = availabilityPct >= AVAILABILITY_TARGET && p95Ms <= P95_TARGET_MS;

  const breachedCount = timeseries.filter((row: any) => n(row.availability_percent) < AVAILABILITY_TARGET).length;
  const compliancePct = timeseries.length > 0
    ? ((timeseries.length - breachedCount) / timeseries.length * 100).toFixed(1)
    : '100.0';

  return (
    <div>
      <PageHeader
        title="SLO / SLI Dashboard"
        icon={<Target size={24} />}
        subtitle="Service Level Objectives — availability targets, error budgets, and historical compliance"
      />

      <FilterBar
        filters={[
          {
            type: 'select',
            key: 'service',
            placeholder: 'All Services',
            options: serviceOptions,
            value: selectedService || undefined,
            onChange: (value: any) => setSelectedService(String(value || '')),
            width: 200,
          },
        ]}
      />

      {/* Compliance banner */}
      {!isLoading && timeseries.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              borderRadius: 8,
              border: `1px solid ${isCompliant ? 'var(--color-success, #12b76a)' : 'var(--color-error, #f04438)'}`,
              background: isCompliant ? 'rgba(18,183,106,0.08)' : 'rgba(240,68,56,0.08)',
            }}
          >
            {isCompliant ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            <span>
              {isCompliant
                ? `All SLOs are being met — ${compliancePct}% of windows compliant`
                : `SLO breach detected — ${breachedCount} window${breachedCount !== 1 ? 's' : ''} below ${AVAILABILITY_TARGET}% availability`}
            </span>
          </div>
        </div>
      )}

      <SloHealthGauges
        isLoading={isLoading}
        availabilityPct={availabilityPct}
        p95Ms={p95Ms}
        errorBudget={errorBudget}
        isCompliant={isCompliant}
        compliancePct={compliancePct}
        timeseriesLength={timeseries.length}
        breachedCount={breachedCount}
        totalRequests={n((data as any)?.summary?.total_requests)}
        averageLatencyMs={n((data as any)?.summary?.avg_latency_ms)}
        availabilityTarget={AVAILABILITY_TARGET}
        p95TargetMs={P95_TARGET_MS}
      />

      {/* Trend Charts — driven by YAML backend config */}
      <div style={{ marginBottom: 16 }}>
        <ConfigurableDashboard
          config={config}
          dataSources={{
            'slo-sli-insights': data,
          }}
          isLoading={isLoading}
        />
      </div>

      <SloComplianceTable
        timeseries={timeseries}
        isLoading={isLoading}
        availabilityTarget={AVAILABILITY_TARGET}
        p95TargetMs={P95_TARGET_MS}
      />
    </div>
  );
}
