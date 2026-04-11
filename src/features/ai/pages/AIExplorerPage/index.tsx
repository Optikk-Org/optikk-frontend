import { Activity, AlertCircle, BrainCircuit, Share2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Badge, Button, Switch } from "@/components/ui";
import type { SimpleTableColumn } from "@/components/ui";
import { ExplorerResultsTable, FacetRail } from "@/features/explorer-core/components";
import {
  type AggregationSpec,
  AnalyticsToolbar,
  type ExplorerVizMode,
} from "@/features/explorer-core/components/AnalyticsToolbar";
import { SummaryMetricStrip } from "@/features/explorer-core/components/SummaryMetricStrip";
import { AnalyticsPieChart } from "@/features/explorer-core/components/visualizations/AnalyticsPieChart";
import { AnalyticsTable } from "@/features/explorer-core/components/visualizations/AnalyticsTable";
import { AnalyticsTimeseries } from "@/features/explorer-core/components/visualizations/AnalyticsTimeseries";
import { AnalyticsTopList } from "@/features/explorer-core/components/visualizations/AnalyticsTopList";
import { useExplorerAnalytics } from "@/features/explorer-core/hooks/useExplorerAnalytics";
import { resolveTimeBounds } from "@/features/explorer-core/utils/timeRange";
import { cn } from "@/lib/utils";
import type { StructuredFilter } from "@/shared/hooks/useURLFilters";
import { useTimeRange } from "@app/store/appStore";
import {
  ObservabilityDetailPanel,
  ObservabilityQueryBar,
  PageHeader,
  PageShell,
  PageSurface,
} from "@shared/components/ui";
import {
  formatDuration,
  formatNumber,
  formatRelativeTime,
  formatTimestamp,
} from "@shared/utils/formatters";

import { AI_ANALYTICS_FIELDS, AI_FILTER_FIELDS, AI_METRIC_FIELDS } from "../../constants";
import { useAICallDetail } from "../../hooks/useAICallDetail";
import { useAIExplorer } from "../../hooks/useAIExplorer";
import type { AICallRecord } from "../../types";
import { formatCost } from "../../utils/costCalculator";

import type { SummaryMetric } from "@/features/explorer-core/types";

function renderStatus(status: string) {
  const normalized = (status || "UNSET").toUpperCase();
  const variant = normalized === "ERROR" ? "error" : normalized === "OK" ? "success" : "default";
  return <Badge variant={variant}>{normalized}</Badge>;
}

function renderProviderBadge(provider: string) {
  return (
    <Badge variant="info" className="text-[11px]">
      {provider || "unknown"}
    </Badge>
  );
}

function upsertFacetFilter(
  filters: StructuredFilter[],
  nextField: string,
  nextValue: string | null
): StructuredFilter[] {
  const withoutField = filters.filter((filter) => filter.field !== nextField);
  if (!nextValue) return withoutField;
  return [...withoutField, { field: nextField, operator: "equals", value: nextValue }];
}

export default function AIExplorerPage() {
  const timeRange = useTimeRange();

  const {
    isLoading,
    isError,
    aiCalls,
    total,
    summary,
    facets,
    errorRate,
    selectedProvider,
    selectedModel,
    errorsOnly,
    page,
    pageSize,
    filters,
    explorerQuery,
    setSelectedProvider,
    setSelectedModel,
    setErrorsOnly,
    setPage,
    setPageSize,
    setFilters,
    clearAll,
  } = useAIExplorer();

  const [explorerMode, setExplorerMode] = useState<"list" | "analytics">("list");
  const [vizMode, setVizMode] = useState<ExplorerVizMode>("table");
  const [groupBy, setGroupBy] = useState<string[]>(["gen_ai.request.model"]);
  const [aggregations, setAggregations] = useState<AggregationSpec[]>([
    { function: "count", alias: "count" },
  ]);
  const [analyticsStep, setAnalyticsStep] = useState("5m");

  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);

  const analyticsEnabled =
    explorerMode === "analytics" && groupBy.length > 0 && aggregations.length > 0;

  const analyticsQuery = useExplorerAnalytics("traces", {
    query: explorerQuery ? `@gen_ai.system:* AND ${explorerQuery}` : "@gen_ai.system:*",
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

  const [selectedCall, setSelectedCall] = useState<AICallRecord | null>(null);
  const detailFields = useAICallDetail(selectedCall);

  // --- Summary metrics strip ---
  const summaryMetrics = useMemo<SummaryMetric[]>(
    () => [
      {
        key: "total_calls",
        label: "LLM Calls",
        value: formatNumber(summary.total_calls),
        tone: "default",
      },
      {
        key: "error_rate",
        label: "Error Rate",
        value: `${errorRate.toFixed(1)}%`,
        tone: errorRate > 5 ? "danger" : errorRate > 1 ? "warning" : "success",
      },
      {
        key: "avg_latency",
        label: "Avg Latency",
        value: formatDuration(summary.avg_latency_ms),
        tone: "default",
      },
      {
        key: "p95_latency",
        label: "P95 Latency",
        value: formatDuration(summary.p95_latency_ms),
        tone: summary.p95_latency_ms > 10000 ? "warning" : "default",
      },
      {
        key: "total_tokens",
        label: "Total Tokens",
        value: formatNumber(summary.total_input_tokens + summary.total_output_tokens),
        tone: "accent",
      },
      {
        key: "estimated_cost",
        label: "Est. Cost",
        value: formatCost(
          aiCalls.reduce((sum, call) => sum + call.estimated_cost, 0)
        ),
        tone: "accent",
        hint: "Estimated from model pricing table",
      },
    ],
    [summary, errorRate, aiCalls]
  );

  // --- Table columns ---
  const columns = useMemo<SimpleTableColumn<AICallRecord>[]>(
    () => [
      {
        title: "Time",
        key: "start_time",
        dataIndex: "start_time",
        width: 160,
        sorter: (a, b) =>
          new Date(String(a.start_time)).getTime() - new Date(String(b.start_time)).getTime(),
        defaultSortOrder: "descend",
        render: (value) => (
          <div className="space-y-1">
            <div className="text-[12px] text-[var(--text-primary)]">
              {formatTimestamp(String(value))}
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">
              {formatRelativeTime(String(value))}
            </div>
          </div>
        ),
      },
      {
        title: "Provider",
        key: "ai_system",
        dataIndex: "ai_system",
        width: 100,
        sorter: (a, b) => a.ai_system.localeCompare(b.ai_system),
        render: (value) => renderProviderBadge(String(value)),
      },
      {
        title: "Model",
        key: "ai_request_model",
        dataIndex: "ai_request_model",
        width: 170,
        ellipsis: true,
        sorter: (a, b) => a.ai_request_model.localeCompare(b.ai_request_model),
        render: (value) => (
          <span className="font-mono text-[11px] text-[var(--text-primary)]">
            {String(value || "—")}
          </span>
        ),
      },
      {
        title: "Operation",
        key: "ai_operation",
        dataIndex: "ai_operation",
        width: 110,
        render: (value) =>
          value ? (
            <Badge variant="default" className="text-[10px]">
              {String(value)}
            </Badge>
          ) : (
            <span className="text-[var(--text-muted)]">—</span>
          ),
      },
      {
        title: "Service",
        key: "service_name",
        dataIndex: "service_name",
        width: 140,
        ellipsis: true,
        sorter: (a, b) => a.service_name.localeCompare(b.service_name),
        render: (value) => (
          <span className="font-medium text-[12.5px] text-[var(--text-primary)]">
            {String(value || "Unknown")}
          </span>
        ),
      },
      {
        title: "Status",
        key: "status",
        dataIndex: "status",
        width: 90,
        sorter: (a, b) => a.status.localeCompare(b.status),
        render: (value) => renderStatus(String(value)),
      },
      {
        title: "Latency",
        key: "duration_ms",
        dataIndex: "duration_ms",
        width: 100,
        sorter: (a, b) => a.duration_ms - b.duration_ms,
        render: (value) => (
          <span className="font-medium text-[var(--text-primary)]">
            {formatDuration(Number(value ?? 0))}
          </span>
        ),
      },
      {
        title: "Tokens In",
        key: "input_tokens",
        dataIndex: "input_tokens",
        width: 90,
        sorter: (a, b) => a.input_tokens - b.input_tokens,
        render: (value) => (
          <span className="text-[12px] text-[var(--text-secondary)]">
            {Number(value) > 0 ? formatNumber(Number(value)) : "—"}
          </span>
        ),
      },
      {
        title: "Tokens Out",
        key: "output_tokens",
        dataIndex: "output_tokens",
        width: 90,
        sorter: (a, b) => a.output_tokens - b.output_tokens,
        render: (value) => (
          <span className="text-[12px] text-[var(--text-secondary)]">
            {Number(value) > 0 ? formatNumber(Number(value)) : "—"}
          </span>
        ),
      },
      {
        title: "Est. Cost",
        key: "estimated_cost",
        dataIndex: "estimated_cost",
        width: 90,
        sorter: (a, b) => a.estimated_cost - b.estimated_cost,
        render: (value) => (
          <span className="font-mono text-[11px] text-[var(--text-secondary)]">
            {Number(value) > 0 ? formatCost(Number(value)) : "—"}
          </span>
        ),
      },
    ],
    []
  );

  // --- Facet groups ---
  const facetGroups = useMemo(
    () => [
      { key: "ai_system", label: "Provider", buckets: facets.ai_system },
      { key: "ai_model", label: "Model", buckets: facets.ai_model },
      { key: "ai_operation", label: "Operation", buckets: facets.ai_operation },
      { key: "service_name", label: "Service", buckets: facets.service_name },
      { key: "status", label: "Status", buckets: facets.status },
      { key: "finish_reason", label: "Finish Reason", buckets: facets.finish_reason },
    ],
    [facets]
  );

  const selectedFacetState = useMemo(
    () => ({
      ai_system: selectedProvider,
      ai_model: selectedModel,
      ai_operation: filters.find((f) => f.field === "operation")?.value ?? null,
      service_name: filters.find((f) => f.field === "service_name")?.value ?? null,
      status: errorsOnly ? "ERROR" : null,
      finish_reason: filters.find((f) => f.field === "finish_reason")?.value ?? null,
    }),
    [errorsOnly, filters, selectedModel, selectedProvider]
  );

  return (
    <PageShell>
      <PageHeader
        title="AI Observability"
        icon={<BrainCircuit size={22} />}
        subtitle="Explore LLM calls — latency, tokens, cost, and errors across models and providers."
        actions={
          <Button
            variant="ghost"
            size="sm"
            icon={<Share2 size={14} />}
            onClick={async () => {
              await navigator.clipboard.writeText(window.location.href);
              toast.success("Share link copied");
            }}
          >
            Share
          </Button>
        }
      />

      <PageSurface padding="lg" className="relative z-[40] overflow-visible">
        <div className="flex flex-col gap-4">
          <SummaryMetricStrip metrics={summaryMetrics} />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="info">
                <Sparkles size={12} className="mr-1 inline" />
                GenAI Spans
              </Badge>
              <Badge variant={summary.error_calls > 0 ? "error" : "default"}>
                {formatNumber(summary.error_calls)} errors
              </Badge>
            </div>
          </div>

          <div className="relative z-[70] grid items-start gap-3 lg:grid-cols-[1fr]">
            <ObservabilityQueryBar
              fields={AI_FILTER_FIELDS}
              filters={filters}
              setFilters={(nextFilters: StructuredFilter[]) => {
                setFilters(nextFilters);
                setPage(1);
              }}
              onClearAll={clearAll}
              placeholder="model:gpt-4o AND provider:openai — or use Search filter"
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
                      setPage(1);
                    }}
                  />
                </div>
              }
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
            fieldOptions={AI_ANALYTICS_FIELDS}
            metricFields={AI_METRIC_FIELDS}
          />
        </div>
      </PageSurface>

      <div
        className={cn(
          "relative z-0 grid gap-4",
          explorerMode === "list" ? "xl:grid-cols-[300px_minmax(0,1fr)]" : "grid-cols-1"
        )}
      >
        {explorerMode === "list" ? (
          <>
            <FacetRail
              groups={facetGroups}
              selected={selectedFacetState}
              onSelect={(groupKey, value) => {
                if (groupKey === "ai_system") {
                  setSelectedProvider(value);
                  setPage(1);
                  return;
                }
                if (groupKey === "ai_model") {
                  setSelectedModel(value);
                  setPage(1);
                  return;
                }
                if (groupKey === "status") {
                  setErrorsOnly(value === "ERROR");
                  setPage(1);
                  return;
                }
                setFilters(upsertFacetFilter(filters, groupKey, value));
                setPage(1);
              }}
            />

            {isError && (
              <div className="mb-3 flex items-center gap-2 rounded-[var(--card-radius)] border border-[rgba(240,68,56,0.3)] bg-[rgba(240,68,56,0.08)] px-4 py-3 text-[var(--color-error)]">
                <AlertCircle size={16} className="shrink-0" />
                <span className="font-medium text-sm">Failed to load AI calls</span>
              </div>
            )}

            <ExplorerResultsTable
              title="AI Explorer"
              subtitle={`${formatNumber(aiCalls.length)} rows in view, ${formatNumber(total)} total calls`}
              rows={aiCalls}
              columns={columns}
              rowKey={(row) => `${row.trace_id}-${row.span_id}`}
              isLoading={isLoading}
              page={page}
              pageSize={pageSize}
              showPagination
              total={total}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              onRow={(row) => ({
                onClick: () => setSelectedCall(row),
              })}
              rowClassName={(row) =>
                cn(
                  "cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.04)]",
                  selectedCall?.span_id === row.span_id &&
                    "bg-[rgba(10,174,214,0.12)] ring-1 ring-[rgba(10,174,214,0.28)] ring-inset"
                )
              }
            />
          </>
        ) : (
          <PageSurface padding="lg" className="min-h-[320px]">
            {analyticsQuery.isLoading ? (
              <div className="text-[13px] text-[var(--text-muted)]">Loading analytics...</div>
            ) : analyticsQuery.isError ? (
              <div className="text-[13px] text-[var(--color-error)]">Analytics request failed.</div>
            ) : analyticsQuery.data ? (
              <div className="space-y-4">
                {vizMode === "timeseries" ? (
                  <AnalyticsTimeseries result={analyticsQuery.data} />
                ) : null}
                {vizMode === "toplist" ? <AnalyticsTopList result={analyticsQuery.data} /> : null}
                {vizMode === "table" || vizMode === "list" ? (
                  <AnalyticsTable result={analyticsQuery.data} />
                ) : null}
                {vizMode === "piechart" ? <AnalyticsPieChart result={analyticsQuery.data} /> : null}
              </div>
            ) : (
              <div className="text-[13px] text-[var(--text-muted)]">
                Configure group by and metrics.
              </div>
            )}
          </PageSurface>
        )}
      </div>

      {selectedCall ? (
        <ObservabilityDetailPanel
          title="AI Call Detail"
          titleBadge={renderStatus(selectedCall.status)}
          metaLine={formatTimestamp(selectedCall.start_time)}
          metaRight={formatRelativeTime(selectedCall.start_time)}
          summaryNode={
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {renderProviderBadge(selectedCall.ai_system)}
                <span className="font-mono font-semibold text-[var(--text-primary)] text-sm">
                  {selectedCall.ai_request_model || "Unknown model"}
                </span>
              </div>
              <div className="text-[var(--text-secondary)] text-xs">
                {selectedCall.service_name} &middot; {formatDuration(selectedCall.duration_ms)}
                {selectedCall.total_tokens > 0
                  ? ` \u00b7 ${formatNumber(selectedCall.total_tokens)} tokens`
                  : ""}
                {selectedCall.estimated_cost > 0
                  ? ` \u00b7 ${formatCost(selectedCall.estimated_cost)}`
                  : ""}
              </div>
            </div>
          }
          actions={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  window.location.href = `/traces/${selectedCall.trace_id}`;
                }}
              >
                View full trace
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  window.location.href = `/logs?query=${encodeURIComponent(`trace_id:${selectedCall.trace_id}`)}`;
                }}
              >
                Related logs
              </Button>
            </>
          }
          fields={detailFields}
          rawData={selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      ) : null}
    </PageShell>
  );
}
