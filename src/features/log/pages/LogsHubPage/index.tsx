import { useCallback, useEffect, useMemo, useState } from "react";

import { useCursorPagination } from "@/features/explorer-core/hooks/useCursorPagination";
import { buildLogsQueryString } from "@/features/explorer-core/utils/structuredFilterQuery";
import { resolveTimeBounds } from "@/features/explorer-core/utils/timeRange";
import { cn } from "@/lib/utils";
import { useURLFilters } from "@/shared/hooks/useURLFilters";
import { useTimeRange } from "@app/store/appStore";
import { toApiErrorShape } from "@shared/api/utils/errorNormalization";
import { PageShell } from "@shared/components/ui";

import { useLogDetailFields } from "../../hooks/useLogDetailFields";
import { useLogsHubData } from "../../hooks/useLogsHubData";
import type { LogRecord } from "../../types";
import { LOGS_URL_FILTER_CONFIG, compileLogsStructuredFilters } from "../../utils/logUtils";

import { LogsHubExplorerChrome } from "./components/LogsHubExplorerChrome";
import { LogsHubListSection } from "./components/LogsHubListSection";
import { LogsHubLogDetailPanel } from "./components/LogsHubLogDetailPanel";
import { LogsHubPageHeader } from "./components/LogsHubPageHeader";
import { type LogsFacetSelectionContext, handleLogsFacetSelect } from "./facetSelection";
import { useLogsHubColumns } from "./hooks/useLogsHubColumns";
import { useLogsHubFacetModel } from "./hooks/useLogsHubFacetModel";
import { useLogsHubShareCallbacks } from "./hooks/useLogsHubShareCallbacks";

export default function LogsHubPage() {
  const timeRange = useTimeRange();
  const { onCopyShareLink, onExportViewJson } = useLogsHubShareCallbacks();

  const {
    values: urlValues,
    setters: urlSetters,
    structuredFilters: filters,
    setStructuredFilters: setFilters,
    clearAll: clearURLFilters,
  } = useURLFilters(LOGS_URL_FILTER_CONFIG);

  const errorsOnly = urlValues.errorsOnly === true;

  const setErrorsOnly = (value: boolean): void => {
    urlSetters.errorsOnly?.(value);
  };

  const cursorState = useCursorPagination();
  const { cursor, goNext, goPrev, reset: resetCursor, hasPrev } = cursorState;
  const [pageSize, setPageSize] = useState(20);
  const [selectedLog, setSelectedLog] = useState<LogRecord | null>(null);

  const filterQuery = useMemo(
    () => buildLogsQueryString({ filters, errorsOnly }),
    [filters, errorsOnly]
  );

  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);

  // Reset the cursor stack whenever a filter that invalidates it changes.
  useEffect(() => {
    resetCursor();
  }, [filterQuery, startTime, endTime, pageSize, resetCursor]);

  const {
    logs,
    logsLoading,
    logsError,
    logsErrorDetail,
    hasMore,
    nextCursor,
    serviceFacets,
    levelFacets,
    hostFacets,
    podFacets,
    containerFacets,
    environmentFacets,
    scopeNameFacets,
    errorCount,
  } = useLogsHubData({
    filterQuery,
    filters,
    cursor,
    pageSize,
  });

  const detailFields = useLogDetailFields(selectedLog);
  const normalizedLogsError = useMemo(
    () => (logsErrorDetail ? toApiErrorShape(logsErrorDetail) : null),
    [logsErrorDetail]
  );

  const { activeSelections, facetGroups } = useLogsHubFacetModel(filters, errorsOnly, {
    serviceFacets,
    levelFacets,
    hostFacets,
    podFacets,
    containerFacets,
    environmentFacets,
    scopeNameFacets,
  });

  const onSelectLog = useCallback((row: LogRecord) => {
    setSelectedLog(row);
  }, []);

  const columns = useLogsHubColumns(onSelectLog);

  const hasActiveFilters = filters.length > 0 || errorsOnly;
  const onClearAllFilters = useCallback(() => {
    clearURLFilters();
    resetCursor();
  }, [clearURLFilters, resetCursor]);

  const facetCtx: LogsFacetSelectionContext = useMemo(
    () => ({
      filters,
      setFilters,
      setErrorsOnly,
      resetPage: resetCursor,
    }),
    [filters, setFilters, setErrorsOnly, resetCursor]
  );

  const onFacetSelect = useCallback(
    (groupKey: string, value: string | null) => {
      handleLogsFacetSelect(groupKey, value, facetCtx);
    },
    [facetCtx]
  );

  return (
    <PageShell>
      <LogsHubPageHeader onCopyShareLink={onCopyShareLink} onExportViewJson={onExportViewJson} />

      <LogsHubExplorerChrome
        errorCount={errorCount}
        filters={filters}
        setFilters={setFilters}
        clearURLFilters={clearURLFilters}
        resetPage={resetCursor}
        errorsOnly={errorsOnly}
        setErrorsOnly={setErrorsOnly}
      />

      <div className={cn("relative z-0 grid gap-4", "xl:grid-cols-[300px_minmax(0,1fr)]")}>
        <LogsHubListSection
          facetGroups={facetGroups}
          activeSelections={activeSelections}
          onFacetSelect={onFacetSelect}
          logsError={logsError}
          normalizedLogsError={normalizedLogsError}
          logs={logs}
          columns={columns}
          logsLoading={logsLoading}
          pageSize={pageSize}
          hasMore={hasMore}
          hasPrev={hasPrev}
          onNext={() => goNext(nextCursor)}
          onPrev={goPrev}
          onPageSizeChange={(size) => {
            setPageSize(size);
            resetCursor();
          }}
          selectedLog={selectedLog}
          onSelectLog={onSelectLog}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={onClearAllFilters}
        />
      </div>

      {selectedLog ? (
        <LogsHubLogDetailPanel
          log={selectedLog}
          detailFields={detailFields}
          onClose={() => setSelectedLog(null)}
        />
      ) : null}
    </PageShell>
  );
}
