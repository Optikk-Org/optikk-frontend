import type { ColumnConfig, ColumnDef } from "@/features/explorer/types/results";
import { ResultsArea } from "@/features/explorer/components/list/ResultsArea";
import { TrendHistogramStrip } from "@/features/explorer/components/trend/TrendHistogramStrip";
import type { TrendBucket } from "@/features/explorer/components/trend/TrendHistogramStrip";
import { TRACE_TREND_SERIES } from "@/features/explorer/utils/trend";

import { LatencyTrendStrip } from "../../components/LatencyTrendStrip";
import { TraceSortToggle, type TraceSortMode } from "../../components/TraceSortToggle";
import type { LatencyTrendPoint } from "../../hooks/useTracesLatencyTrend";
import type { TraceSummary } from "../../types/trace";
import { getTraceRowId } from "./tracesColumns";

interface Props {
  readonly trendBuckets: readonly TrendBucket[];
  readonly latencyPoints: readonly LatencyTrendPoint[];
  readonly zoomed: boolean;
  readonly onTimeRangeChange: (fromMs: number, toMs: number) => void;
  readonly sortMode: TraceSortMode;
  readonly onSortChange: (mode: TraceSortMode) => void;
  readonly rows: readonly TraceSummary[];
  readonly columns: readonly ColumnDef<TraceSummary>[];
  readonly columnConfig: readonly ColumnConfig[];
  readonly onColumnConfigChange: (next: readonly ColumnConfig[]) => void;
  readonly onRowClick: (row: TraceSummary) => void;
  readonly resetKey: string;
  readonly loading: boolean;
  readonly queryError: string | null;
  readonly onRetry: () => void;
}

/** Right pane for the traces explorer: trend, latency overlay, sort, result list. */
export function TracesResultsPane(props: Props) {
  return (
    <>
      {props.trendBuckets.length > 0 ? (
        <TrendHistogramStrip
          buckets={props.trendBuckets}
          series={TRACE_TREND_SERIES}
          zoomed={props.zoomed}
          onTimeRangeChange={props.onTimeRangeChange}
        />
      ) : null}
      <LatencyTrendStrip points={props.latencyPoints} />
      <TraceSortToggle mode={props.sortMode} onChange={props.onSortChange} />
      <ResultsArea<TraceSummary>
        rows={props.rows}
        columns={props.columns}
        config={props.columnConfig}
        onConfigChange={props.onColumnConfigChange}
        getRowId={getTraceRowId}
        onRowClick={props.onRowClick}
        resetKey={props.resetKey}
        loading={props.loading}
        queryError={props.queryError}
        onRetry={props.onRetry}
        emptyTitle="No traces"
        emptyDescription="Adjust filters or broaden the time range."
      />
    </>
  );
}
