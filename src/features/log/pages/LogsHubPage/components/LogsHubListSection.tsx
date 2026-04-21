import { AlertCircle, Inbox } from "lucide-react";
import { memo, useCallback } from "react";

import type { SimpleTableColumn } from "@/components/ui";
import { ExplorerResultsTable, FacetRail } from "@/features/explorer-core/components";
import type { FacetGroup } from "@/features/explorer-core/types";
import { cn } from "@/lib/utils";
import { ERROR_CODE_LABELS } from "@/shared/constants/errorCodes";
import { formatNumber } from "@shared/utils/formatters";
import { rowKey as logRowKey } from "@shared/utils/logUtils";

import type { LogRecord } from "../../../types";

type NormalizedError = { code: string; message: string } | null;

type Props = {
  facetGroups: FacetGroup[];
  activeSelections: Record<string, string | null | undefined>;
  onFacetSelect: (groupKey: string, value: string | null) => void;
  logsError: boolean;
  normalizedLogsError: NormalizedError;
  logs: LogRecord[];
  columns: SimpleTableColumn<LogRecord>[];
  logsLoading: boolean;
  pageSize: number;
  hasMore: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  onPageSizeChange: (size: number) => void;
  selectedLog: LogRecord | null;
  onSelectLog: (row: LogRecord) => void;
  /** True when any filter (structured filter or errors-only toggle) is active. */
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

function hasFacetData(groups: FacetGroup[]): boolean {
  return groups.some((group) => group.buckets.some((bucket) => bucket.count > 0));
}

function LogsHubListSectionComponent({
  facetGroups,
  activeSelections,
  onFacetSelect,
  logsError,
  normalizedLogsError,
  logs,
  columns,
  logsLoading,
  pageSize,
  hasMore,
  hasPrev,
  onNext,
  onPrev,
  onPageSizeChange,
  selectedLog,
  onSelectLog,
  hasActiveFilters,
  onClearFilters,
}: Props) {
  const handleRow = useCallback(
    (row: LogRecord) => ({ onClick: () => onSelectLog(row) }),
    [onSelectLog]
  );

  const showFacets = hasFacetData(facetGroups);
  const emptyState = (
    <div className="flex flex-col items-center gap-2 rounded-[var(--card-radius)] border border-dashed border-[var(--border-color)] bg-[var(--bg-tertiary)] px-6 py-10 text-center">
      <Inbox size={20} className="text-[var(--text-muted)]" />
      {hasActiveFilters ? (
        <>
          <p className="font-medium text-[var(--text-primary)] text-sm">No logs match current filters</p>
          <p className="max-w-md text-[12px] text-[var(--text-muted)]">
            Clear filters or broaden the time range to see more logs.
          </p>
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-1 text-[12px] text-[var(--color-primary)] hover:underline"
          >
            Clear filters
          </button>
        </>
      ) : (
        <>
          <p className="font-medium text-[var(--text-primary)] text-sm">No logs in this window</p>
          <p className="max-w-md text-[12px] text-[var(--text-muted)]">
            Check that your OTLP producer is writing logs to this team, or widen the time range.
            Raw logs have a 1-hour TTL in local dev; rollups retain 90 days.
          </p>
        </>
      )}
    </div>
  );

  return (
    <>
      {showFacets ? (
        <FacetRail groups={facetGroups} selected={activeSelections} onSelect={onFacetSelect} />
      ) : null}

      {logsError && normalizedLogsError ? (
        <div className="mb-3 flex items-center gap-2 rounded-[var(--card-radius)] border border-[rgba(240,68,56,0.3)] bg-[rgba(240,68,56,0.08)] px-4 py-3 text-[var(--color-error)]">
          <AlertCircle size={16} className="shrink-0" />
          <span className="font-medium text-sm">
            {ERROR_CODE_LABELS[normalizedLogsError.code] ?? "Error"}
          </span>
          <span className="text-sm opacity-80">
            {normalizedLogsError.message || "Failed to load logs"}
          </span>
        </div>
      ) : null}

      <ExplorerResultsTable
        title="Logs"
        subtitle={`${formatNumber(logs.length)} rows in view${hasMore ? " — more available" : ""}`}
        rows={logs}
        columns={columns}
        rowKey={(row) => logRowKey(row)}
        isLoading={logsLoading}
        pagination={{
          hasMore,
          hasPrev,
          onNext,
          onPrev,
          pageSize,
          onPageSizeChange,
        }}
        onRow={handleRow}
        rowClassName={(row) =>
          cn(
            "cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.04)]",
            selectedLog?.timestamp === row.timestamp &&
              "bg-[rgba(10,174,214,0.12)] ring-1 ring-[rgba(10,174,214,0.28)] ring-inset"
          )
        }
        emptyState={emptyState}
      />
    </>
  );
}

export const LogsHubListSection = memo(LogsHubListSectionComponent);
