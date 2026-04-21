import { Activity } from "lucide-react";
import { memo } from "react";

import { Badge, Select, Switch } from "@/components/ui";
import type { SelectOption } from "@/components/ui";
import {
  type AggregationSpec,
  AnalyticsToolbar,
  type ExplorerVizMode,
} from "@/features/explorer-core/components/AnalyticsToolbar";
import { cn } from "@/lib/utils";
import type { StructuredFilter } from "@/shared/hooks/useURLFilters";
import { ObservabilityQueryBar, PageSurface } from "@shared/components/ui";
import { formatNumber } from "@shared/utils/formatters";

import { TRACE_FILTER_FIELDS } from "../../../utils/tracesUtils";

import { TRACE_METRIC_FIELDS } from "../constants";

type ExplorerMode = "list" | "analytics";

type Props = {
  mode: string;
  modeOptions: SelectOption[];
  onModeChange: (value: string) => void;
  errorTraces: number;
  filters: StructuredFilter[];
  setFilters: (next: StructuredFilter[]) => void;
  clearAll: () => void;
  resetPage: () => void;
  errorsOnly: boolean;
  setErrorsOnly: (v: boolean) => void;
  explorerMode: ExplorerMode;
  setExplorerMode: (m: ExplorerMode) => void;
  vizMode: ExplorerVizMode;
  setVizMode: (m: ExplorerVizMode) => void;
  groupBy: string[];
  setGroupBy: (g: string[]) => void;
  aggregations: AggregationSpec[];
  setAggregations: (a: AggregationSpec[]) => void;
  analyticsStep: string;
  setAnalyticsStep: (s: string) => void;
};

function TracesExplorerChromeComponent({
  mode,
  modeOptions,
  onModeChange,
  errorTraces,
  filters,
  setFilters,
  clearAll,
  resetPage,
  errorsOnly,
  setErrorsOnly,
  explorerMode,
  setExplorerMode,
  vizMode,
  setVizMode,
  groupBy,
  setGroupBy,
  aggregations,
  setAggregations,
  analyticsStep,
  setAnalyticsStep,
}: Props) {
  return (
    <PageSurface padding="lg" className="relative z-[40] overflow-visible">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="info">{mode === "all" ? "All spans" : "Root spans"}</Badge>
            <Badge variant={errorTraces > 0 ? "error" : "default"}>
              {formatNumber(errorTraces)} error traces
            </Badge>
          </div>
        </div>

        <div className="relative z-[70] grid items-start gap-3 lg:grid-cols-[minmax(320px,1fr)_220px]">
          <ObservabilityQueryBar
            fields={TRACE_FILTER_FIELDS}
            filters={filters}
            setFilters={(nextFilters: StructuredFilter[]) => {
              setFilters(nextFilters);
              resetPage();
            }}
            onClearAll={clearAll}
            placeholder="service:api AND status:ERROR — or use Search filter"
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
          <Select
            value={mode}
            onChange={(value) => {
              onModeChange(String(value));
              resetPage();
            }}
            options={modeOptions}
          />
        </div>
        <AnalyticsToolbar
          mode={explorerMode}
          onModeChange={setExplorerMode}
          vizMode={vizMode}
          onVizModeChange={setVizMode}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          aggregations={aggregations}
          onAggregationsChange={setAggregations}
          step={analyticsStep}
          onStepChange={setAnalyticsStep}
          fieldOptions={[
            ...TRACE_FILTER_FIELDS.map((f) => ({ name: f.key, description: f.label })),
          ]}
          metricFields={TRACE_METRIC_FIELDS}
        />
      </div>
    </PageSurface>
  );
}

export const TracesExplorerChrome = memo(TracesExplorerChromeComponent);
