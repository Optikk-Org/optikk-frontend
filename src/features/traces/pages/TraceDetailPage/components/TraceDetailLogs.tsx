import { Badge, SimpleTable } from "@/components/ui";
import { FileText } from "lucide-react";
import { memo } from "react";

import { APP_COLORS } from "@config/colorLiterals";
import { PageSurface } from "@shared/components/ui";

import { LOG_COLUMNS } from "../logColumns";

interface Props {
  traceLogs: Array<Record<string, unknown> & { timestamp?: string | number; service_name?: string }>;
  traceLogsIsSpeculative: boolean;
  logsLoading: boolean;
}

function TraceDetailLogsComponent({ traceLogs, traceLogsIsSpeculative, logsLoading }: Props) {
  return (
    <PageSurface className="space-y-4">
      <div className="flex items-center gap-2 font-semibold text-[15px] text-[var(--text-primary)]">
        <FileText size={18} />
        <span>Associated Logs</span>
        {traceLogs.length > 0 ? (
          <Badge
            color="default"
            style={{
              marginLeft: 8,
              background: APP_COLORS.rgba_255_255_255_0p06_2,
              border: "none",
              color: "var(--text-secondary)",
            }}
          >
            {traceLogs.length} events
          </Badge>
        ) : null}
        {traceLogs.length > 0 ? (
          <Badge variant={traceLogsIsSpeculative ? "warning" : "success"}>
            {traceLogsIsSpeculative ? "Heuristic correlation" : "Exact trace correlation"}
          </Badge>
        ) : null}
      </div>
      {traceLogsIsSpeculative ? (
        <p className="text-[var(--text-secondary)] text-sm">
          These logs were matched from surrounding service and time context because an exact
          trace-linked set was not available.
        </p>
      ) : null}

      {logsLoading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <div className="ok-spinner" />
        </div>
      ) : traceLogs.length === 0 ? (
        <div className="py-8 text-center text-[var(--text-muted)]">
          No logs associated with this trace
        </div>
      ) : (
        <SimpleTable
          columns={LOG_COLUMNS as never}
          dataSource={traceLogs}
          rowKey={(row, index) =>
            `${(row as { timestamp?: string | number }).timestamp ?? ""}-${(row as { service_name?: string }).service_name ?? ""}-${index}`
          }
          size="small"
          pagination={false}
          scroll={{ y: 300 }}
          className="glass-table"
        />
      )}
    </PageSurface>
  );
}

export const TraceDetailLogs = memo(TraceDetailLogsComponent);
