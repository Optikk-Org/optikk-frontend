import { Activity } from "lucide-react";
import { memo } from "react";

import { Badge, Button, Switch } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { StructuredFilter } from "@/shared/hooks/useURLFilters";
import { ObservabilityQueryBar, PageSurface } from "@shared/components/ui";
import { formatNumber } from "@shared/utils/formatters";

import { LOG_FILTER_FIELDS, upsertLogFacetFilter } from "../../../utils/logUtils";

type Props = {
  errorCount: number;
  filters: StructuredFilter[];
  setFilters: (next: StructuredFilter[]) => void;
  clearURLFilters: () => void;
  resetPage: () => void;
  errorsOnly: boolean;
  setErrorsOnly: (v: boolean) => void;
};

function LogsHubExplorerChromeComponent({
  errorCount,
  filters,
  setFilters,
  clearURLFilters,
  resetPage,
  errorsOnly,
  setErrorsOnly,
}: Props) {
  return (
    <PageSurface padding="lg" className="relative z-[40] overflow-visible">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">All logs</Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setFilters(upsertLogFacetFilter(filters, "optik.rum", "true"));
                resetPage();
              }}
            >
              RUM stream
            </Button>
            <Badge variant={errorCount > 0 ? "error" : "default"}>
              {formatNumber(errorCount)} error logs
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearURLFilters();
                resetPage();
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="relative z-[70] grid items-start gap-3 lg:grid-cols-[minmax(320px,1fr)_220px]">
          <ObservabilityQueryBar
            fields={LOG_FILTER_FIELDS}
            filters={filters}
            setFilters={(nextFilters: StructuredFilter[]) => {
              setFilters(nextFilters);
              resetPage();
            }}
            onClearAll={() => {
              clearURLFilters();
              resetPage();
            }}
            placeholder="Search logs — e.g. service:web AND status:error"
            rightSlot={
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors",
                  errorsOnly
                    ? "border-[rgba(240,68,56,0.35)] bg-[rgba(240,68,56,0.08)] text-[var(--color-error)]"
                    : "border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                )}
              >
                <Activity size={13} />
                Errors only
                <Switch
                  size="sm"
                  checked={errorsOnly}
                  onChange={(event) => {
                    setErrorsOnly(event.target.checked);
                    resetPage();
                  }}
                />
              </div>
            }
          />
          <div className="hidden lg:block" aria-hidden />
        </div>
      </div>
    </PageSurface>
  );
}

export const LogsHubExplorerChrome = memo(LogsHubExplorerChromeComponent);
