import { Surface, Skeleton, Tabs } from '@shared/design-system';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import PageHeader from '@shared/components/ui/layout/PageHeader';

import { useDashboardConfig } from '@shared/hooks/useDashboardConfig';


import { useServiceDetailData } from '../../hooks/useServiceDetailData';

import { APP_COLORS } from '@config/colorLiterals';


import {
  ServiceDetailDependenciesTab,
  ServiceDetailErrorsTab,
  ServiceDetailLogsTab,
  ServiceDetailOverviewTab,
  ServiceDetailStatsRow,
} from '../../components/detail';


import { getEndpointColumns, getErrorColumns, getLogColumns } from '../../utils/serviceDetailUtils';

/**
 *
 */
export default function ServiceDetailPage() {
  const { serviceName: serviceNameParam } = useParams();
  const serviceName = serviceNameParam ?? '';
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'errors' | 'logs' | 'dependencies'>('overview');
  const { config } = useDashboardConfig('service-detail');
  const {
    endpoints,
    errorGroups,
    timeSeries,
    logs,
    serviceDependencies,
    stats,
    errorRate,
    avgLatency,
    p95Latency,
    requestsSparkline,
    errorSparkline,
    isLoading,
    endpointsLoading,
    errorsLoading,
    timeSeriesLoading,
    logsLoading,
  } = useServiceDetailData({ serviceName, activeTab });

  const endpointColumns = getEndpointColumns();
  const errorColumns = getErrorColumns({ navigate });
  const logColumns = getLogColumns({ navigate });

  const breadcrumbs = [
    { label: 'Services', path: '/services' },
    { label: serviceName },
  ];

  const headerActions = (
    <button
      onClick={() => navigate('/services')}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
        background: `var(--bg-secondary, ${APP_COLORS.hex_0d0d0d})`, border: `1px solid var(--border-color, ${APP_COLORS.hex_2d2d2d})`,
        borderRadius: 6, cursor: 'pointer', fontSize: 14, color: `var(--text-primary, ${APP_COLORS.hex_fff})`,
      }}
    >
      <ArrowLeft size={16} /> Back to Services
    </button>
  );

  if (isLoading && !logsLoading) {
    return (
      <div>
        <PageHeader title={serviceName} breadcrumbs={breadcrumbs} actions={headerActions} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[1, 2, 3, 4].map((index) => (
            <Surface key={index}><Skeleton count={2} /></Surface>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={serviceName} breadcrumbs={breadcrumbs} actions={headerActions} />

      <ServiceDetailStatsRow
        stats={{ totalRequests: stats.totalRequests }}
        errorRate={errorRate}
        avgLatency={avgLatency}
        p95Latency={p95Latency}
        requestsSparkline={requestsSparkline}
        errorSparkline={errorSparkline}
      />

      {/* Tabs for different views */}
      <Surface>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'overview' | 'errors' | 'logs' | 'dependencies')}
          items={[
            {
              key: 'overview',
              label: 'Overview',
              children: (
                <ServiceDetailOverviewTab
                  config={config}
                  timeSeries={timeSeries}
                  endpoints={endpoints}
                  timeSeriesLoading={timeSeriesLoading}
                  endpointsLoading={endpointsLoading}
                  endpointColumns={endpointColumns}
                />
              ),
            },
            {
              key: 'errors',
              label: `Errors (${errorGroups.length})`,
              children: (
                <ServiceDetailErrorsTab
                  errorGroups={errorGroups}
                  errorsLoading={errorsLoading}
                  errorColumns={errorColumns}
                />
              ),
            },
            {
              key: 'logs',
              label: `Logs (${logs.length})`,
              children: (
                <ServiceDetailLogsTab
                  logs={logs}
                  logsLoading={logsLoading}
                  logColumns={logColumns}
                  onTraceNavigate={(traceId: string) => navigate(`/traces/${traceId}`)}
                />
              ),
            },
            {
              key: 'dependencies',
              label: `Dependencies (${serviceDependencies.length})`,
              children: (
                <ServiceDetailDependenciesTab
                  serviceName={serviceName}
                  serviceDependencies={serviceDependencies}
                  onNavigateService={(targetService: string) =>
                    navigate(`/services/${encodeURIComponent(targetService)}`)
                  }
                />
              ),
            },
          ]}
        />
      </Surface>
    </div>
  );
}
