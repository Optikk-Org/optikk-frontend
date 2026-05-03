import type { ColumnDef } from "@/features/explorer/types/results";
import { HighlightedText } from "@shared/components/primitives/HighlightedText";

import type { LogRecord } from "../../types/log";
import { severityColor, severityStyle } from "../../utils/severity";

/**
 * Factory for the typed log column defs. Pass the active free-text search
 * term so the body cell can underline matches inline (Datadog parity).
 * Keys match `DEFAULT_LOG_COLUMNS` / `ALL_LOG_COLUMNS` so toggling via
 * `useExplorerColumns` keeps working.
 */
export function buildLogColumns(searchTerm: string | undefined): readonly ColumnDef<LogRecord>[] {
  return [
    {
      key: "timestamp",
      label: "Time",
      width: 180,
      render: (row) => (
        <span className="font-mono text-xs text-[var(--text-secondary)]">
          {formatTs(row.timestamp)}
        </span>
      ),
    },
    {
      key: "service",
      label: "Service",
      width: 160,
      render: (row) => <span className="truncate text-sm">{row.service_name}</span>,
    },
    {
      key: "severity",
      label: "Severity",
      width: 84,
      render: (row) => <SeverityBadge bucket={row.severity_bucket} />,
    },
    {
      key: "severity_bucket",
      label: "Severity #",
      width: 90,
      render: (row) => (
        <span className="font-mono text-xs text-[var(--text-secondary)]">
          {row.severity_bucket}
        </span>
      ),
    },
    {
      key: "host",
      label: "Host",
      width: 160,
      render: (row) => <span className="truncate text-xs">{row.host ?? ""}</span>,
    },
    {
      key: "pod",
      label: "Pod",
      width: 160,
      render: (row) => <span className="truncate text-xs">{row.pod ?? ""}</span>,
    },
    {
      key: "container",
      label: "Container",
      width: 140,
      render: (row) => <span className="truncate text-xs">{row.container ?? ""}</span>,
    },
    {
      key: "environment",
      label: "Env",
      width: 100,
      render: (row) => <span className="truncate text-xs">{row.environment ?? ""}</span>,
    },
    {
      key: "body",
      label: "Body",
      render: (row) => (
        <HighlightedText className="truncate text-sm" text={row.body} match={searchTerm} />
      ),
    },
    {
      key: "trace_id",
      label: "Trace",
      width: 140,
      render: (row) => (
        <span className="truncate font-mono text-xs text-[var(--text-tertiary)]">
          {(row.trace_id ?? "").slice(0, 12)}
        </span>
      ),
    },
  ];
}

function SeverityBadge({ bucket }: { bucket: number }) {
  const style = severityStyle(bucket);
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
      style={{ backgroundColor: `${severityColor(bucket)}22`, color: severityColor(bucket) }}
    >
      {style.shortLabel}
    </span>
  );
}

function formatTs(ts: string): string {
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    return d.toISOString().slice(11, 23).replace("T", "");
  } catch {
    return ts;
  }
}
