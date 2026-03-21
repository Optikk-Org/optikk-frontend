import { BarChart3 } from 'lucide-react';
import { DashboardPage, PageHeader, PageShell } from '@shared/components/ui';

/**
 * Metrics page — RED metrics tabs fully driven by backend YAML config.
 */
export default function MetricsPage() {

  return (
    <PageShell>
      <PageHeader
        title="Metrics"
        icon={<BarChart3 size={24} />}
        subtitle="System-wide performance metrics"
      />
      <DashboardPage pageId="metrics" />
    </PageShell>
  );
}
