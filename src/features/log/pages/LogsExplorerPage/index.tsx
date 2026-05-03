import { ExplorerHeader } from "@/features/explorer/components/chrome/ExplorerHeader";
import { SummaryStrip } from "@/features/explorer/components/chrome/SummaryStrip";
import { DetailDrawer } from "@/features/explorer/components/detail/DetailDrawer";
import { FacetRail } from "@/features/explorer/components/facets/FacetRail";
import { ResultsArea } from "@/features/explorer/components/list/ResultsArea";
import { TrendHistogramStrip } from "@/features/explorer/components/trend/TrendHistogramStrip";
import type { ExplorerFilter } from "@/features/explorer/types/filters";
import { LOG_TREND_SERIES } from "@/features/explorer/utils/trend";
import { SavedViewsDropdown } from "@/features/savedViews/components/SavedViewsDropdown";

import LogDetailDrawer from "../../components/LogDetailDrawer";
import type { LogRecord } from "../../types/log";
import { useLogsExplorerPage } from "./useLogsExplorerPage";

/** Three-zone logs explorer: header + facet rail + virtualized results +
 *  detail drawer. Four parallel reads (list/summary/trend/facets) render
 *  independently — see `useLogsExplorer`. All state, derivations, and
 *  callbacks live in `useLogsExplorerPage`. */
export default function LogsExplorerPage() {
  const p = useLogsExplorerPage();
  return (
    <div className="flex h-full flex-col bg-[var(--bg-primary)]">
      <ExplorerHeader
        ref={p.searchInputRef}
        filters={p.state.filters}
        onChangeFilters={(f: readonly ExplorerFilter[]) => p.state.setFilters(f)}
        onSubmitFreeText={p.handlers.onSubmitFreeText}
        actions={<SavedViewsDropdown scope="logs" onLoad={p.handlers.onLoadSavedView} />}
        kpiStrip={p.kpis.length > 0 ? <SummaryStrip kpis={p.kpis} /> : null}
      />
      <div className="flex flex-1 overflow-hidden">
        <FacetRail
          groups={p.facetGroups}
          onInclude={p.handlers.onInclude}
          onExclude={p.handlers.onExclude}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          {p.trendBuckets.length > 0 ? (
            <TrendHistogramStrip
              buckets={p.trendBuckets}
              series={LOG_TREND_SERIES}
              zoomed={p.timeRange.kind === "absolute"}
              onTimeRangeChange={p.handlers.onTimeRangeChange}
            />
          ) : null}
          <ResultsArea<LogRecord>
            rows={p.list.results}
            columns={p.columnDefs}
            config={p.columnConfig}
            onConfigChange={p.setColumns}
            getRowId={(row) => row.id}
            onRowClick={p.handlers.onRowClick}
            selectedId={p.state.detail}
            resetKey={p.filterKey}
            loading={p.list.isPending}
            queryError={p.queryError}
            getRowClassName={p.getRowClassName}
            getRowStyle={p.getRowStyle}
            onRetry={p.handlers.onRetry}
            onLoadMore={p.list.loadMore}
            getContextMenuItems={p.getContextMenuItems}
            footer={p.footer}
            emptyTitle="No logs"
            emptyDescription="Adjust filters or broaden the time range."
          />
        </div>
      </div>
      <DetailDrawer
        open={Boolean(p.state.detail)}
        onOpenChange={(o) => (o ? null : p.state.setDetail(null))}
        title="Log detail"
        widthPx={720}
      >
        {p.state.detail ? (
          <LogDetailDrawer logId={p.state.detail} onClose={() => p.state.setDetail(null)} />
        ) : null}
      </DetailDrawer>
    </div>
  );
}
