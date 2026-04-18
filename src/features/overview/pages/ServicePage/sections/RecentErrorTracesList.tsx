import { useNavigate } from "@tanstack/react-router";

import type { TraceRecord } from "@entities/trace/model";
import { Badge } from "@shared/components/primitives/ui";
import { ROUTES } from "@/shared/constants/routes";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";
import { formatDuration, formatRelativeTime } from "@shared/utils/formatters";

import { useRecentErrorTraces } from "./useRecentErrorTraces";

interface RecentErrorTracesListProps {
  readonly serviceName: string;
}

function TraceRow({
  trace,
  onOpen,
}: {
  trace: TraceRecord;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center justify-between gap-3 rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-2 text-left transition-colors hover:border-[var(--color-primary-subtle-45)] hover:bg-[var(--bg-hover)]"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge variant="error">
            {trace.http_status_code || trace.status_message || "ERROR"}
          </Badge>
          <span className="truncate font-medium text-[12px] text-[var(--text-primary)]">
            {trace.operation_name}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-[var(--text-muted)]">
          {trace.trace_id.slice(0, 12)} · {formatRelativeTime(trace.start_time)}
        </div>
      </div>
      <span className="shrink-0 text-[11px] text-[var(--text-secondary)]">
        {formatDuration(trace.duration_ms)}
      </span>
    </button>
  );
}

export default function RecentErrorTracesList({ serviceName }: RecentErrorTracesListProps) {
  const navigate = useNavigate();
  const { traces, loading } = useRecentErrorTraces(serviceName);

  if (loading && traces.length === 0) {
    return <div className="text-[12px] text-[var(--text-muted)]">Loading error traces…</div>;
  }

  if (traces.length === 0) {
    return <div className="text-[12px] text-[var(--text-muted)]">No error traces in this range.</div>;
  }

  const open = (traceId: string) =>
    navigate(dynamicNavigateOptions(ROUTES.traceDetail.replace("$traceId", traceId)));

  return (
    <div className="flex flex-col gap-2">
      {traces.map((trace) => (
        <TraceRow key={trace.span_id} trace={trace} onOpen={() => open(trace.trace_id)} />
      ))}
    </div>
  );
}
