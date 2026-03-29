import { Timer } from 'lucide-react';
import { useState } from 'react';

import FilterBar from '@shared/components/ui/forms/FilterBar';
import PageHeader from '@shared/components/ui/layout/PageHeader';
import { PageShell } from '@shared/components/ui';
import ConfigurableDashboard from '@shared/components/ui/dashboard/ConfigurableDashboard';

import { useDashboardConfig } from '@shared/hooks/useDashboardConfig';
import { useComponentDataFetcher } from '@shared/hooks/useComponentDataFetcher';

import type { ChangeEvent } from 'react';

/**
 * Latency Analysis page — renders a fully config-driven dashboard
 * using the latency-analysis.json tab definition.
 *
 * The filter bar is kept for service/operation filtering.
 */
export default function LatencyAnalysisPage({ embedded = false }) {
  const [serviceName, setServiceName] = useState('');
  const [operationName, setOperationName] = useState('');

  const { config, isLoading: configLoading } = useDashboardConfig('latency-analysis');

  const { data, isLoading: dataLoading, errors } = useComponentDataFetcher(config?.panels ?? []);

  const content = (
    <>
      {!embedded && <PageHeader title="Latency Analysis" icon={<Timer size={24} />} />}

      <FilterBar
        filters={[
          {
            type: 'search',
            key: 'service',
            placeholder: 'Filter by service',
            value: serviceName || undefined,
            onChange: (event: ChangeEvent<HTMLInputElement>) => setServiceName(event.target.value),
            width: 200,
          },
          {
            type: 'search',
            key: 'operation',
            placeholder: 'Filter by operation',
            value: operationName || undefined,
            onChange: (event: ChangeEvent<HTMLInputElement>) =>
              setOperationName(event.target.value),
            width: 200,
          },
        ]}
      />

      <ConfigurableDashboard
        config={config}
        dataSources={data}
        errors={errors}
        isLoading={configLoading || dataLoading}
      />
    </>
  );

  if (embedded) {
    return <div className="flex flex-col gap-4">{content}</div>;
  }

  return <PageShell>{content}</PageShell>;
}
