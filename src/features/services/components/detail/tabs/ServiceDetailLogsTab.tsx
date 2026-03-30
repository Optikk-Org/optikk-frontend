import { Surface } from '@/components/ui';

import DataTable from '@shared/components/ui/data-display/DataTable';

interface ServiceDetailLogsTabProps {
  logs: any[];
  logsLoading: boolean;
  logColumns: any[];
  onTraceNavigate: (traceId: string) => void;
}

/**
 * Logs tab for service detail page.
 */
export default function ServiceDetailLogsTab({
  logs,
  logsLoading,
  logColumns,
  onTraceNavigate,
}: ServiceDetailLogsTabProps): JSX.Element {
  return (
    <Surface elevation={1} padding="md" className="chart-card">
      <DataTable
        data={{
          columns: logColumns,
          rows: logs,
          loading: logsLoading,
          rowKey: (record: any) => `${record.timestamp}-${record.trace_id}-${record.span_id}`,
        }}
        config={{
          onRow: (record: any) => ({
            onClick: () => record.trace_id && onTraceNavigate(record.trace_id),
            style: { cursor: record.trace_id ? 'pointer' : 'default' },
          }),
        }}
      />
    </Surface>
  );
}
