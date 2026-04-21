import type { SelectOption } from "@/components/ui";
import type {
  AggregationSpec,
  ExplorerVizMode,
} from "@/features/explorer-core/components/AnalyticsToolbar";
import { useExplorerAnalytics } from "@/features/explorer-core/hooks/useExplorerAnalytics";
import { resolveTimeBounds } from "@/features/explorer-core/utils/timeRange";
import { cn } from "@/lib/utils";
import { useTimeRange } from "@app/store/appStore";
import { toApiErrorShape } from "@shared/api/utils/errorNormalization";
import { PageShell } from "@shared/components/ui";

import { useTraceDetailFields } from "../../hooks/useTraceDetailFields";
import { useTracesExplorer } from "../../hooks/useTracesExplorer";
import type { TraceRecord } from "../../types";

import { useCallback, useMemo, useRef, useState } from "react";
import { TracesAnalyticsSection } from "./components/TracesAnalyticsSection";
import { TracesDetailPanel } from "./components/TracesDetailPanel";
import { TracesExplorerChrome } from "./components/TracesExplorerChrome";
import { TracesListSection } from "./components/TracesListSection";
import { TracesPageHeader } from "./components/TracesPageHeader";
import { type TracesFacetSelectionContext, handleTracesFacetSelect } from "./facetSelection";
import { useTracesFacetModel } from "./hooks/useTracesFacetModel";
import { useTracesTableColumns } from "./hooks/useTracesTableColumns";

export default function TracesPage() {
  const timeRange = useTimeRange();

  const {
    isPending: isLoading,
    isError,
    error,
    traces,
    errorTraces,
    facets,
    filterQuery,
    selectedService,
    errorsOnly,
    mode,
    pageSize,
    hasMore,
    hasPrev,
    onNext,
    onPrev,
    filters,
    setSelectedService,
    setErrorsOnly,
    setMode,
    setPageSize,
    resetCursor,
    setFilters,
    clearAll,
  } = useTracesExplorer();

  const [explorerMode, setExplorerMode] = useState<"list" | "analytics">("list");
  const [vizMode, setVizMode] = useState<ExplorerVizMode>("table");
  const [groupBy, setGroupBy] = useState<string[]>(["service"]);
  const [aggregations, setAggregations] = useState<AggregationSpec[]>([
    { function: "count", alias: "count" },
  ]);
  const [analyticsStep, setAnalyticsStep] = useState("5m");

  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);

  const analyticsEnabled =
    explorerMode === "analytics" && groupBy.length > 0 && aggregations.length > 0;

  const analyticsQuery = useExplorerAnalytics("traces", {
    query: filterQuery,
    startTime,
    endTime,
    groupBy,
    aggregations: aggregations.map((a) => ({
      function: a.function,
      field: a.field,
      alias: a.alias || "m",
    })),
    vizMode: vizMode === "list" ? "table" : vizMode,
    step: analyticsStep,
    limit: 500,
    enabled: analyticsEnabled,
  });

  const [selectedTrace, setSelectedTrace] = useState<TraceRecord | null>(null);
  const [selectedTraceIds, setSelectedTraceIds] = useState<string[]>([]);
  const selectedTraceIdsRef = useRef<string[]>(selectedTraceIds);
  selectedTraceIdsRef.current = selectedTraceIds;
  const normalizedError = useMemo(() => (error ? toApiErrorShape(error) : null), [error]);

  const detailFields = useTraceDetailFields(selectedTrace);

  const columns = useTracesTableColumns(selectedTraceIdsRef, setSelectedTraceIds);

  const { facetGroups, selectedFacetState } = useTracesFacetModel(
    facets,
    filters,
    errorsOnly,
    selectedService
  );

  const modeOptions = useMemo<SelectOption[]>(
    () => [
      { label: "Root spans", value: "root" },
      { label: "All spans", value: "all" },
    ],
    []
  );

  const facetCtx: TracesFacetSelectionContext = useMemo(
    () => ({
      filters,
      setFilters,
      setSelectedService,
      setErrorsOnly,
      resetPage: resetCursor,
    }),
    [filters, setFilters, setSelectedService, setErrorsOnly, resetCursor]
  );

  const onFacetSelect = useCallback(
    (groupKey: string, value: string | null) => {
      handleTracesFacetSelect(groupKey, value, facetCtx);
    },
    [facetCtx]
  );

  const onSelectTrace = useCallback((row: TraceRecord) => {
    setSelectedTrace(row);
  }, []);

  return (
    <PageShell>
      <TracesPageHeader />

      <TracesExplorerChrome
        mode={mode}
        modeOptions={modeOptions}
        onModeChange={(value) => setMode(value)}
        errorTraces={errorTraces}
        filters={filters}
        setFilters={setFilters}
        clearAll={clearAll}
        resetPage={resetCursor}
        errorsOnly={errorsOnly}
        setErrorsOnly={setErrorsOnly}
        explorerMode={explorerMode}
        setExplorerMode={setExplorerMode}
        vizMode={vizMode}
        setVizMode={setVizMode}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        aggregations={aggregations}
        setAggregations={setAggregations}
        analyticsStep={analyticsStep}
        setAnalyticsStep={setAnalyticsStep}
      />

      <div
        className={cn(
          "relative z-0 grid gap-4",
          explorerMode === "list" ? "xl:grid-cols-[300px_minmax(0,1fr)]" : "grid-cols-1"
        )}
      >
        {explorerMode === "list" ? (
          <TracesListSection
            facetGroups={facetGroups}
            selectedFacetState={selectedFacetState}
            onFacetSelect={onFacetSelect}
            isError={isError}
            normalizedError={normalizedError}
            renderedTraces={traces}
            columns={columns}
            isLoading={isLoading}
            pageSize={pageSize}
            hasMore={hasMore}
            hasPrev={hasPrev}
            onNext={onNext}
            onPrev={onPrev}
            onPageSizeChange={setPageSize}
            selectedTrace={selectedTrace}
            onSelectTrace={onSelectTrace}
          />
        ) : (
          <TracesAnalyticsSection vizMode={vizMode} analyticsQuery={analyticsQuery} />
        )}
      </div>

      {selectedTrace ? (
        <TracesDetailPanel
          trace={selectedTrace}
          detailFields={detailFields}
          onClose={() => setSelectedTrace(null)}
        />
      ) : null}
    </PageShell>
  );
}
