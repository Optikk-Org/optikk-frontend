/**
 * LLM Traces Explorer — Faceted span list with filters, proper histogram,
 * sort toggles, and pagination.
 *
 * Fully integrated with explorer-core components (FacetRail, ExplorerResultsTable)
 * per user feedback to ensure 100% UI consistency across all domains.
 */
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useTimeRange, useTeamId, useRefreshKey } from "@app/store/appStore";
import { resolveTimeRangeBounds } from "@/types";
import { aiService } from "../api/aiService";
import type { AiExplorerFilterParams, AiSpan } from "../types";
import { AiStatCard } from "../components/AiStatCard";
import { AiMiniChart } from "../components/AiMiniChart";
import { formatNumber, formatMs } from "../utils/formatters";
import type { SimpleTableColumn } from "@/components/ui";
import { ExplorerResultsTable, FacetRail } from "@/features/explorer-core/components";
import { PageHeader, PageShell, PageSurface } from "@shared/components/ui";
import { Activity, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type SortField = "timestamp" | "duration" | "tokens";

export default function AiExplorerPage() {
  const timeRange = useTimeRange();
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();
  const { startTime: startMs, endTime: endMs } = useMemo(() => resolveTimeRangeBounds(timeRange), [timeRange]);
  const navigate = useNavigate();

  const [filters, setFilters] = useState<AiExplorerFilterParams>({
    limit: 50,
    offset: 0,
    sort: "timestamp",
    sortDir: "desc",
  });

  const [pageSize, setPageSize] = useState(50);
  const page = Math.floor((filters.offset || 0) / pageSize) + 1;

  const queryKeyBase = [teamId, startMs, endMs, refreshKey, filters];

  const spans = useQuery({
    queryKey: ["ai-explorer-spans", ...queryKeyBase],
    queryFn: () => aiService.getSpans(startMs, endMs, filters),
  });

  const summary = useQuery({
    queryKey: ["ai-explorer-summary", ...queryKeyBase],
    queryFn: () => aiService.getExplorerSummary(startMs, endMs, filters),
  });

  const facets = useQuery({
    queryKey: ["ai-explorer-facets", teamId, startMs, endMs, refreshKey],
    queryFn: () => aiService.getFacets(startMs, endMs),
  });

  const histogram = useQuery({
    queryKey: ["ai-explorer-histogram", ...queryKeyBase],
    queryFn: () => aiService.getHistogram(startMs, endMs, filters),
  });

  const s = summary.data;
  const histoChartData = useMemo(
    () => (histogram.data ?? []).map((h) => ({ timestamp: h.timestamp, value: h.count })),
    [histogram.data],
  );

  // ---- Columns ----
  const columns = useMemo<SimpleTableColumn<AiSpan>[]>(
    () => [
      {
        title: "Timestamp",
        key: "timestamp",
        dataIndex: "timestamp",
        width: 160,
        sorter: () => 0, // Handled server-side
        sortOrder: filters.sort === "timestamp" ? (filters.sortDir === "asc" ? "ascend" : "descend") : null,
        onHeaderCell: () => ({
          onClick: () => {
            setFilters((prev) => ({
              ...prev,
              offset: 0,
              sort: "timestamp",
              sortDir: prev.sort === "timestamp" && prev.sortDir === "desc" ? "asc" : "desc",
            }));
          },
        }),
        render: (val, row) => (
          <div className="font-mono text-[11px] text-[var(--text-primary)]">
            {new Date(row.timestamp).toLocaleString()}
          </div>
        ),
      },
      {
        title: "Operation",
        key: "operationName",
        dataIndex: "operationName",
        width: 140,
        render: (val, row) => (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-[12.5px] text-[var(--text-primary)]">{val || "—"}</span>
            <span className="text-[11px] text-[var(--text-muted)] truncate">{row.serviceName}</span>
          </div>
        ),
      },
      {
        title: "Model",
        key: "model",
        dataIndex: "model",
        width: 120,
        render: (val, row) => (
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[11.5px] text-[var(--text-secondary)]">{val || "—"}</span>
            {row.provider && <span className="text-[10px] text-[var(--text-muted)] uppercase">{row.provider}</span>}
          </div>
        ),
      },
      {
        title: "Duration",
        key: "durationMs",
        dataIndex: "durationMs",
        width: 100,
        sorter: () => 0,
        sortOrder: filters.sort === "duration" ? (filters.sortDir === "asc" ? "ascend" : "descend") : null,
        onHeaderCell: () => ({
          onClick: () => {
            setFilters((prev) => ({
              ...prev,
              offset: 0,
              sort: "duration",
              sortDir: prev.sort === "duration" && prev.sortDir === "desc" ? "asc" : "desc",
            }));
          },
        }),
        render: (val) => <span className="font-mono text-[12px]">{formatMs(Number(val))}</span>,
      },
      {
        title: "Tokens",
        key: "totalTokens",
        dataIndex: "totalTokens",
        width: 150,
        sorter: () => 0,
        sortOrder: filters.sort === "tokens" ? (filters.sortDir === "asc" ? "ascend" : "descend") : null,
        onHeaderCell: () => ({
          onClick: () => {
            setFilters((prev) => ({
              ...prev,
              offset: 0,
              sort: "tokens",
              sortDir: prev.sort === "tokens" && prev.sortDir === "desc" ? "asc" : "desc",
            }));
          },
        }),
        render: (_, row) => (
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[12px]">{formatNumber(row.totalTokens)}</span>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-blue-400">↑{formatNumber(row.inputTokens)}</span>
              <span className="text-green-400">↓{formatNumber(row.outputTokens)}</span>
            </div>
          </div>
        ),
      },
      {
        title: "Status",
        key: "hasError",
        dataIndex: "hasError",
        width: 90,
        render: (hasError, row) =>
          hasError ? (
            <span className="inline-flex items-center gap-1 rounded bg-[rgba(240,68,56,0.15)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-error)]">
              <AlertCircle size={10} /> Err
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded bg-[rgba(34,197,94,0.15)] px-1.5 py-0.5 text-[10px] font-semibold text-green-500">
              <Activity size={10} /> OK
            </span>
          ),
      },
    ],
    [filters.sort, filters.sortDir]
  );

  // ---- Facet groups ----
  const facetGroups = useMemo(() => {
    if (!facets.data) return [];
    return [
      { key: "service", label: "Service", buckets: facets.data.services.values || [] },
      { key: "model", label: "Model", buckets: facets.data.models.values || [] },
      { key: "provider", label: "Provider", buckets: facets.data.providers.values || [] },
      { key: "operation", label: "Operation", buckets: facets.data.operations.values || [] },
      { key: "finishReason", label: "Finish Reason", buckets: facets.data.finishReasons.values || [] },
      {
        key: "status",
        label: "Status",
        buckets: [
          { value: "ok", count: (s?.totalSpans || 0) - (s?.errorCount || 0) },
          { value: "error", count: s?.errorCount || 0 },
        ],
      },
    ];
  }, [facets.data, s]);

  const activeSelections = useMemo(() => {
    return {
      service: filters.service || null,
      model: filters.model || null,
      provider: filters.provider || null,
      operation: filters.operation || null,
      finishReason: filters.finishReason || null,
      status: filters.status || null,
    };
  }, [filters]);

  return (
    <PageShell>
      <PageHeader
        title="AI Explorer"
        icon={<Sparkles size={22} />}
        subtitle="Filter and explore all AI generation spans and token completions."
      />

      {/* Summary Strip */}
      <PageSurface padding="lg" className="mb-4">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "16px" }}>
          <AiStatCard label="Spans" value={formatNumber(s?.totalSpans ?? 0)} />
          <AiStatCard label="Errors" value={formatNumber(s?.errorCount ?? 0)} accent={s && s.errorCount > 0 ? "red" : undefined} />
          <AiStatCard label="Avg Latency" value={formatMs(s?.avgLatencyMs ?? 0)} />
          <AiStatCard label="P95 Latency" value={formatMs(s?.p95Ms ?? 0)} />
          <AiStatCard label="Total Tokens" value={formatNumber(s?.totalTokens ?? 0)} />
          <AiStatCard label="Unique Models" value={s?.uniqueModels ?? 0} />
        </div>

        {/* Histogram Chart */}
        {histoChartData.length > 0 && (
          <div className="mt-8">
            <h3 className="mb-2 font-semibold text-[13px] text-[var(--text-primary)]">Request Volume</h3>
            <AiMiniChart data={histoChartData} color="#6366f1" height={96} formatValue={formatNumber} />
          </div>
        )}
      </PageSurface>

      <div className="relative z-0 grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)]">
        <FacetRail
          groups={facetGroups}
          selected={activeSelections}
          onSelect={(groupKey, value) => {
            setFilters((prev) => ({
              ...prev,
              offset: 0,
              [groupKey]: prev[groupKey as keyof AiExplorerFilterParams] === value ? undefined : value,
            }));
          }}
        />

        <ExplorerResultsTable
          key="ai-explorer"
          title="Spans"
          subtitle={`${formatNumber(spans.data?.length ?? 0)} rows in view, ${formatNumber(s?.totalSpans ?? 0)} total matches`}
          rows={spans.data ?? []}
          columns={columns}
          rowKey={(row) => row.spanId}
          isLoading={spans.isLoading}
          page={page}
          pageSize={pageSize}
          total={s?.totalSpans ?? 0}
          showPagination={true}
          onPageChange={(newPage) => {
            setFilters((prev) => ({
              ...prev,
              offset: Math.max(0, (newPage - 1) * pageSize),
            }));
          }}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setFilters((prev) => ({
              ...prev,
              offset: 0,
              limit: newSize,
            }));
          }}
          onRow={(row) => ({
            onClick: () => navigate({ to: `/ai-explorer/${encodeURIComponent(row.spanId)}` as any }),
          })}
          rowClassName={() => "cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.04)]"}
        />
      </div>
    </PageShell>
  );
}
