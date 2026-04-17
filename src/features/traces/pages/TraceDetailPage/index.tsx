import { Button } from "@/components/ui";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, FileText, GitBranch } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { PageShell, PageSurface } from "@shared/components/ui";
import PageHeader from "@shared/components/ui/layout/PageHeader";

import { useTimeRange } from "@shared/hooks/useTimeRangeQuery";
import { buildLogsHubHref, traceIdEqualsFilter } from "@shared/observability/deepLinks";
import { useAppStore } from "@store/appStore";

import SpanDetailDrawer from "../../components/SpanDetailDrawer";
import { useTraceDetailData } from "../../hooks/useTraceDetailData";
import { useTraceDetailEnhanced } from "../../hooks/useTraceDetailEnhanced";
import { useTraceFlamegraph } from "../../hooks/useTraceFlamegraph";
import "./TraceDetailPage.css";

import { TraceDetailLogs } from "./components/TraceDetailLogs";
import { TraceDetailServiceBar } from "./components/TraceDetailServiceBar";
import { TraceDetailStats } from "./components/TraceDetailStats";
import { TraceDetailVisualization } from "./components/TraceDetailVisualization";
import { computeTraceTimeBounds } from "./utils";

export default function TraceDetailPage() {
  const { traceId } = useParams({ strict: false });
  const traceIdParam = traceId ?? "";
  const navigate = useNavigate();
  const { getTimeRange } = useTimeRange();
  const selectedTeamId = useAppStore((state) => state.selectedTeamId);
  const [activeTab, setActiveTab] = useState<"timeline" | "flamegraph">("timeline");
  const [activeDetailTab, setActiveDetailTab] = useState("attributes");

  const {
    spans,
    traceLogs,
    traceLogsIsSpeculative,
    stats,
    selectedSpan,
    selectedSpanId,
    setSelectedSpanId,
    isPending: isLoading,
    isError,
    error,
    logsLoading,
  } = useTraceDetailData(selectedTeamId, traceIdParam);

  const resolvedTraceId = useMemo(
    () => (spans.length > 0 ? spans[0].trace_id || traceIdParam : traceIdParam),
    [spans, traceIdParam]
  );

  const traceTimeBounds = useMemo(() => computeTraceTimeBounds(spans), [spans]);

  const {
    data: flamegraphData,
    isLoading: flamegraphLoading,
    isError: flamegraphError,
  } = useTraceFlamegraph(traceIdParam, activeTab === "flamegraph");

  const {
    criticalPathSpanIds,
    errorPathSpanIds,
    spanKindBreakdown,
    spanEvents,
    spanSelfTimes,
    relatedTraces,
    spanAttributes,
    spanAttributesLoading,
  } = useTraceDetailEnhanced(
    traceIdParam,
    selectedSpanId,
    selectedSpan ?? spans[0] ?? null,
    traceTimeBounds.startMs,
    traceTimeBounds.endMs,
    activeDetailTab
  );

  const handleSpanClick = useCallback(
    (span: { span_id?: string }) => {
      setSelectedSpanId(span.span_id ?? null);
    },
    [setSelectedSpanId]
  );

  const openInLogExplorer = useCallback(() => {
    const { startTime, endTime } = getTimeRange();
    const fromMs = traceTimeBounds.startMs ?? Number(startTime);
    const toMs = traceTimeBounds.endMs ?? Number(endTime);
    navigate({
      to: buildLogsHubHref({
        filters: [traceIdEqualsFilter(resolvedTraceId)],
        fromMs,
        toMs,
      }) as never,
    });
  }, [getTimeRange, navigate, resolvedTraceId, traceTimeBounds.endMs, traceTimeBounds.startMs]);

  return (
    <PageShell className="trace-page-fade-in min-h-[calc(100vh-64px)]">
      <PageHeader
        title={`Trace: ${traceIdParam}`}
        icon={<GitBranch size={24} />}
        breadcrumbs={[{ label: "Traces", path: "/traces" }, { label: traceIdParam }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<FileText size={16} />}
              onClick={openInLogExplorer}
            >
              Open in log explorer
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowLeft size={16} />}
              onClick={() => navigate({ to: "/traces" })}
            >
              Back to Traces
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <PageSurface className="flex min-h-[320px] items-center justify-center">
          <div className="ok-spinner" />
        </PageSurface>
      ) : isError ? (
        <PageSurface className="space-y-3 py-10 text-center">
          <p className="font-medium text-[var(--color-error)] text-base">
            Failed to load trace details
          </p>
          <p className="mx-auto max-w-xl text-[var(--text-secondary)] text-sm">
            {error?.message ||
              "The trace lookup request failed before we could load spans or associated logs."}
          </p>
        </PageSurface>
      ) : (
        <>
          {spans.length === 0 ? (
            <PageSurface className="space-y-3 py-10 text-center">
              <p className="font-medium text-[var(--text-primary)] text-base">
                No spans found for this trace
              </p>
              <p className="mx-auto max-w-xl text-[var(--text-secondary)] text-sm">
                {traceLogs.length > 0
                  ? "Logs in Optik reference this trace ID, but no span rows were found. Timeline and flamegraph need ingested spans; associated logs are listed below."
                  : "There are no span rows for this trace ID in Optik. If you opened this from logs, span data may not be ingested yet, may have aged out, or the trace ID may not match your spans pipeline."}
              </p>
            </PageSurface>
          ) : (
            <>
              <TraceDetailStats
                stats={stats}
                criticalPathCount={criticalPathSpanIds.size}
                linkedLogsCount={traceLogs.length}
              />

              <TraceDetailServiceBar spans={spans} spanKindBreakdown={spanKindBreakdown} />

              <TraceDetailVisualization
                activeTab={activeTab}
                onActiveTabChange={setActiveTab}
                spans={spans}
                selectedSpanId={selectedSpanId}
                onSpanClick={handleSpanClick}
                criticalPathSpanIds={criticalPathSpanIds}
                errorPathSpanIds={errorPathSpanIds}
                flamegraphData={flamegraphData ?? null}
                flamegraphLoading={flamegraphLoading}
                flamegraphError={flamegraphError}
              />

              <SpanDetailDrawer
                selectedSpanId={selectedSpanId}
                selectedSpan={selectedSpan ?? null}
                spanAttributes={spanAttributes}
                spanAttributesLoading={spanAttributesLoading}
                spanEvents={spanEvents}
                spanSelfTimes={spanSelfTimes}
                relatedTraces={relatedTraces}
                activeTab={activeDetailTab}
                onActiveTabChange={setActiveDetailTab}
              />
            </>
          )}

          <TraceDetailLogs
            traceLogs={traceLogs}
            traceLogsIsSpeculative={traceLogsIsSpeculative}
            logsLoading={logsLoading}
          />
        </>
      )}
    </PageShell>
  );
}
