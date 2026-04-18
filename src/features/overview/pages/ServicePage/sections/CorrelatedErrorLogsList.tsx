import { useLocation, useNavigate } from "@tanstack/react-router";

import type { LogRecord } from "@shared/api/schemas/logsSchemas";
import { ROUTES } from "@/shared/constants/routes";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";
import { buildServiceLogsSearch } from "@/features/overview/components/serviceDrawerState";
import { formatTimestamp } from "@shared/utils/formatters";

import { useCorrelatedErrorLogs } from "./useCorrelatedErrorLogs";

interface CorrelatedErrorLogsListProps {
  readonly serviceName: string;
}

function levelClasses(level: string | undefined): string {
  const normalized = (level ?? "").toUpperCase();
  if (normalized === "FATAL" || normalized === "ERROR") return "text-[var(--color-error)]";
  if (normalized === "WARN") return "text-[var(--color-warning)]";
  return "text-[var(--text-muted)]";
}

function readTimestamp(value: LogRecord["timestamp"]): string {
  if (typeof value === "number") return formatTimestamp(value);
  if (!value) return "—";
  const parsed = Number(value);
  if (Number.isFinite(parsed) && String(parsed) === value) {
    return formatTimestamp(parsed / 1_000_000);
  }
  return formatTimestamp(value);
}

function LogRow({ log }: { log: LogRecord }) {
  const level = (log.severity_text ?? log.level ?? "").toUpperCase();
  const message = log.body ?? log.message ?? "";
  return (
    <div className="flex gap-3 rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-2">
      <span className="shrink-0 font-mono text-[11px] text-[var(--text-muted)]">
        {readTimestamp(log.timestamp)}
      </span>
      <span className={`shrink-0 font-semibold text-[11px] ${levelClasses(level)}`}>
        {level || "—"}
      </span>
      <span className="min-w-0 flex-1 font-mono text-[11px] text-[var(--text-primary)]">
        {message || "(no message)"}
      </span>
    </div>
  );
}

export default function CorrelatedErrorLogsList({ serviceName }: CorrelatedErrorLogsListProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logs, loading } = useCorrelatedErrorLogs(serviceName);

  if (loading && logs.length === 0) {
    return <div className="text-[12px] text-[var(--text-muted)]">Loading correlated logs…</div>;
  }

  if (logs.length === 0) {
    return <div className="text-[12px] text-[var(--text-muted)]">No error logs in this range.</div>;
  }

  const openExplorer = () =>
    navigate(
      dynamicNavigateOptions(ROUTES.logs, buildServiceLogsSearch(location.search, serviceName))
    );

  return (
    <div className="flex flex-col gap-2">
      {logs.map((log, index) => (
        <LogRow key={`${log.trace_id ?? ""}:${log.span_id ?? ""}:${index}`} log={log} />
      ))}
      <button
        type="button"
        onClick={openExplorer}
        className="self-start text-[12px] text-[var(--color-primary)] hover:underline"
      >
        View all in Logs explorer →
      </button>
    </div>
  );
}
