import type { ColumnDef } from "@/features/explorer/types/results";

import type { TraceSummary } from "../../types/trace";

export interface TraceColumnContext {
  /** Population percentiles (ms) used by the duration distribution cell. Null while loading. */
  readonly overall: { readonly p50Ms: number; readonly p95Ms: number } | null;
}

/**
 * ColumnDef factory for the traces list. Keys line up with `DEFAULT_TRACE_COLUMNS`
 * (features/traces/config/columns.ts) so `useExplorerColumns` can toggle them.
 */
export function buildTraceColumns(ctx: TraceColumnContext): readonly ColumnDef<TraceSummary>[] {
  return [
    { key: "start", label: "Start", width: 170, render: renderStart },
    { key: "duration", label: "Duration", width: 180, render: (row) => <DurationCell row={row} overall={ctx.overall} /> },
    { key: "service", label: "Service", width: 160, render: (row) => <span className="truncate text-sm">{row.root_service}</span> },
    { key: "operation", label: "Operation", render: (row) => <span className="truncate text-sm">{row.root_operation}</span> },
    { key: "endpoint", label: "Endpoint", width: 200, render: (row) => <span className="truncate text-xs">{row.root_endpoint ?? ""}</span> },
    { key: "status", label: "Status", width: 96, render: (row) => <StatusBadge status={row.root_status} hasError={row.has_error} /> },
    { key: "http_method", label: "Method", width: 80, render: (row) => <span className="font-mono text-xs uppercase">{row.root_http_method ?? ""}</span> },
    { key: "root_http_status", label: "HTTP", width: 80, render: (row) => <span className="font-mono text-xs">{row.root_http_status ?? ""}</span> },
    { key: "span_count", label: "Spans", width: 80, render: (row) => <span className="font-mono text-xs">{row.span_count}</span> },
    { key: "has_error", label: "Error", width: 72, render: (row) => (row.has_error ? <span className="text-xs text-[#e8494d]">●</span> : null) },
    { key: "environment", label: "Env", width: 120, render: (row) => <span className="truncate text-xs">{row.environment ?? ""}</span> },
  ];
}

function renderStart(row: TraceSummary) {
  return (
    <span className="font-mono text-xs text-[var(--text-secondary)]">
      {new Date(row.start_ms).toISOString().slice(11, 23).replace("T", "")}
    </span>
  );
}

function DurationCell({ row, overall }: { row: TraceSummary; overall: TraceColumnContext["overall"] }) {
  const ms = row.duration_ns / 1e6;
  const label = formatMs(ms);
  const color = row.has_error ? "#e8494d" : undefined;
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs" style={{ color }}>{label}</span>
      <DistributionTick ms={ms} overall={overall} hasError={row.has_error} />
    </div>
  );
}

function DistributionTick({ ms, overall, hasError }: { ms: number; overall: TraceColumnContext["overall"]; hasError: boolean }) {
  if (!overall || overall.p95Ms <= 0) return null;
  const maxScale = Math.max(overall.p95Ms * 1.5, ms);
  const pct = Math.min(100, (ms / maxScale) * 100);
  const p50Pct = Math.min(100, (overall.p50Ms / maxScale) * 100);
  const p95Pct = Math.min(100, (overall.p95Ms / maxScale) * 100);
  const tickColor = hasError ? "#e8494d" : ms > overall.p95Ms ? "#e0b400" : "#4e9fdd";
  return (
    <span className="relative inline-block h-2 flex-1 min-w-[60px] rounded bg-[var(--bg-secondary)]" title={`p50 ${formatMs(overall.p50Ms)} · p95 ${formatMs(overall.p95Ms)}`}>
      <span className="absolute top-0 h-full w-px bg-[var(--text-muted)] opacity-50" style={{ left: `${p50Pct}%` }} />
      <span className="absolute top-0 h-full w-px bg-[var(--text-muted)] opacity-70" style={{ left: `${p95Pct}%` }} />
      <span className="absolute top-0 h-full w-1 rounded" style={{ left: `calc(${pct}% - 2px)`, backgroundColor: tickColor }} />
    </span>
  );
}

function StatusBadge({ status, hasError }: { status: string | undefined; hasError: boolean }) {
  const color = hasError ? "#e8494d" : status === "OK" ? "#73bf69" : "#7e8ea0";
  const label = hasError ? "ERROR" : status || "UNSET";
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {label}
    </span>
  );
}

function formatMs(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.round(ms)}ms`;
}

export function getTraceRowId(row: TraceSummary): string {
  return row.trace_id;
}
