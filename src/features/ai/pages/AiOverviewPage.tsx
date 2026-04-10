/**
 * LLM Overview Dashboard — Multi-tab operational dashboard.
 * Tabs: Operations, Models, Cost & Tokens, Errors
 *
 * Now wires up all 6 backend timeseries endpoints + analytics endpoints
 * that were previously unused.
 */
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTimeRange, useTeamId, useRefreshKey } from "@app/store/appStore";
import { resolveTimeRangeBounds } from "@/types";
import { aiService } from "../api/aiService";
import type { AiFilterParams, AiTimeseriesPoint, AiTimeseriesDualPoint } from "../types";
import { AiStatCard } from "../components/AiStatCard";
import { AiMiniChart, AiMultiSeriesChart } from "../components/AiMiniChart";
import { formatNumber, formatMs, formatPercent, formatCost } from "../utils/formatters";
import styles from "./AiOverviewPage.module.css";

type TabKey = "operations" | "models" | "cost" | "errors";

export default function AiOverviewPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("operations");
  const timeRange = useTimeRange();
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();
  const { startTime: startMs, endTime: endMs } = useMemo(() => resolveTimeRangeBounds(timeRange), [timeRange]);
  const [filters] = useState<AiFilterParams>({});
  const navigate = useNavigate();

  const queryKeyBase = [teamId, startMs, endMs, refreshKey, filters];

  // ---- Core summary ----
  const summary = useQuery({
    queryKey: ["ai-summary", ...queryKeyBase],
    queryFn: () => aiService.getSummary(startMs, endMs, filters),
  });

  // ---- Operations tab data ----
  const modelHealth = useQuery({
    queryKey: ["ai-model-health", ...queryKeyBase],
    queryFn: () => aiService.getModelHealth(startMs, endMs, filters),
    enabled: activeTab === "operations",
  });

  const topSlow = useQuery({
    queryKey: ["ai-top-slow", ...queryKeyBase],
    queryFn: () => aiService.getTopSlow(startMs, endMs, filters),
    enabled: activeTab === "operations",
  });

  const tsRequests = useQuery({
    queryKey: ["ai-ts-requests", ...queryKeyBase],
    queryFn: () => aiService.getTimeseriesRequests(startMs, endMs, filters),
    enabled: activeTab === "operations",
  });

  const tsLatency = useQuery({
    queryKey: ["ai-ts-latency", ...queryKeyBase],
    queryFn: () => aiService.getTimeseriesLatency(startMs, endMs, filters),
    enabled: activeTab === "operations",
  });

  // ---- Models tab data ----
  const models = useQuery({
    queryKey: ["ai-models", ...queryKeyBase],
    queryFn: () => aiService.getModels(startMs, endMs, filters),
    enabled: activeTab === "models",
  });

  const tsThroughput = useQuery({
    queryKey: ["ai-ts-throughput", ...queryKeyBase],
    queryFn: () => aiService.getTimeseriesThroughput(startMs, endMs, filters),
    enabled: activeTab === "models",
  });

  // ---- Cost tab data ----
  const tsCost = useQuery({
    queryKey: ["ai-ts-cost", ...queryKeyBase],
    queryFn: () => aiService.getTimeseriesCost(startMs, endMs, filters),
    enabled: activeTab === "cost",
  });

  const tsTokens = useQuery({
    queryKey: ["ai-ts-tokens", ...queryKeyBase],
    queryFn: () => aiService.getTimeseriesTokens(startMs, endMs, filters),
    enabled: activeTab === "cost",
  });

  const tokenEconomics = useQuery({
    queryKey: ["ai-token-economics", ...queryKeyBase],
    queryFn: () => aiService.getTokenEconomics(startMs, endMs, filters),
    enabled: activeTab === "cost",
  });

  const finishReasonTrends = useQuery({
    queryKey: ["ai-finish-trends", ...queryKeyBase],
    queryFn: () => aiService.getFinishReasonTrends(startMs, endMs, filters),
    enabled: activeTab === "cost",
  });

  // ---- Errors tab data ----
  const tsErrors = useQuery({
    queryKey: ["ai-ts-errors", ...queryKeyBase],
    queryFn: () => aiService.getTimeseriesErrors(startMs, endMs, filters),
    enabled: activeTab === "errors",
  });

  const errorPatterns = useQuery({
    queryKey: ["ai-error-patterns", ...queryKeyBase],
    queryFn: () => aiService.getErrorPatterns(startMs, endMs, filters),
    enabled: activeTab === "errors",
  });

  const errorTimeseries = useQuery({
    queryKey: ["ai-error-ts", ...queryKeyBase],
    queryFn: () => aiService.getErrorTimeseries(startMs, endMs, filters),
    enabled: activeTab === "errors",
  });

  const s = summary.data;
  const tabs: { key: TabKey; label: string }[] = [
    { key: "operations", label: "Operations" },
    { key: "models", label: "Models" },
    { key: "cost", label: "Cost & Tokens" },
    { key: "errors", label: "Errors" },
  ];

  // Transform timeseries for charts
  const requestChartData = useMemo(() => aggregateTimeseries(tsRequests.data ?? []), [tsRequests.data]);
  const latencyChartSeries = useMemo(() => aggregateDualTimeseries(tsLatency.data ?? [], "Avg Latency", "P95"), [tsLatency.data]);
  const costChartData = useMemo(() => aggregateTimeseries(tsCost.data ?? []), [tsCost.data]);
  const tokenChartSeries = useMemo(() => aggregateDualTimeseries(tsTokens.data ?? [], "Input Tokens", "Output Tokens"), [tsTokens.data]);
  const throughputChartData = useMemo(() => aggregateTimeseries(tsThroughput.data ?? []), [tsThroughput.data]);
  const errorChartData = useMemo(() => aggregateTimeseries(tsErrors.data ?? []), [tsErrors.data]);

  // Group finish reason trends by reason
  const finishReasonSeries = useMemo(() => {
    const trends = finishReasonTrends.data ?? [];
    const byReason = new Map<string, { timestamp: string; value: number }[]>();
    for (const t of trends) {
      const arr = byReason.get(t.finishReason) ?? [];
      arr.push({ timestamp: t.timestamp, value: t.count });
      byReason.set(t.finishReason, arr);
    }
    const colors = ["#6366f1", "#22c55e", "#eab308", "#ef4444", "#06b6d4", "#f97316"];
    return [...byReason.entries()].map(([reason, data], i) => ({
      label: reason || "unknown",
      data,
      color: colors[i % colors.length],
    }));
  }, [finishReasonTrends.data]);

  return (
    <div className={styles.page}>
      {/* ---- Hero Stat Cards ---- */}
      <div className={styles.statGrid}>
        <AiStatCard label="Total Requests" value={formatNumber(s?.totalRequests ?? 0)} />
        <AiStatCard label="Error Rate" value={formatPercent(s?.errorRate ?? 0)} accent={s && s.errorRate > 5 ? "red" : undefined} />
        <AiStatCard label="Avg Latency" value={formatMs(s?.avgLatencyMs ?? 0)} />
        <AiStatCard label="P95 Latency" value={formatMs(s?.p95Ms ?? 0)} />
        <AiStatCard label="Total Tokens" value={formatNumber(s?.totalTokens ?? 0)} />
        <AiStatCard label="Unique Models" value={s?.uniqueModels ?? 0} />
        <AiStatCard label="Token/sec" value={`${(s?.avgTokensPerSec ?? 0).toFixed(1)}`} />
        <AiStatCard label="Services" value={s?.uniqueServices ?? 0} />
      </div>

      {/* ---- Tab Bar ---- */}
      <div className={styles.tabBar}>
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${activeTab === t.key ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ---- Tab Content ---- */}
      <div className={styles.tabContent}>
        {activeTab === "operations" && (
          <>
            {/* Charts row */}
            <div className={styles.gridTwo}>
              <div className={styles.panel}>
                <h3 className={styles.panelTitle}>Request Rate</h3>
                <AiMiniChart data={requestChartData} color="#6366f1" height={96} label="Requests / bucket" formatValue={formatNumber} />
              </div>
              <div className={styles.panel}>
                <h3 className={styles.panelTitle}>Latency Trend</h3>
                <AiMultiSeriesChart
                  series={latencyChartSeries.map((s) => ({
                    ...s,
                    color: s.label === "P95" ? "#f59e0b" : "#6366f1",
                  }))}
                  height={96}
                />
              </div>
            </div>

            {/* Tables row */}
            <div className={styles.gridTwo}>
              <div className={styles.panel}>
                <h3 className={styles.panelTitle}>Model Health</h3>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead><tr><th>Model</th><th>Provider</th><th>Requests</th><th>P95 (ms)</th><th>Error %</th><th>Health</th></tr></thead>
                    <tbody>
                      {(modelHealth.data ?? []).map((m) => (
                        <tr key={m.model} className={styles.clickRow} onClick={() => navigate({ to: `/ai-models/${encodeURIComponent(m.model)}` as any })}>
                          <td className={styles.mono}>{m.model}</td>
                          <td>{m.provider}</td>
                          <td>{formatNumber(m.requestCount)}</td>
                          <td>{m.p95Ms.toFixed(0)}</td>
                          <td>{formatPercent(m.errorRate)}</td>
                          <td><span className={`${styles.badge} ${styles[m.health]}`}>{m.health}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className={styles.panel}>
                <h3 className={styles.panelTitle}>Top Slow Operations</h3>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead><tr><th>Model</th><th>Operation</th><th>P95 (ms)</th><th>Count</th></tr></thead>
                    <tbody>
                      {(topSlow.data ?? []).map((t, i) => (
                        <tr key={i}>
                          <td className={styles.mono}>{t.model}</td>
                          <td>{t.operation}</td>
                          <td>{t.p95Ms.toFixed(0)}</td>
                          <td>{formatNumber(t.requestCount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "models" && (
          <>
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>Token Throughput</h3>
              <AiMiniChart data={throughputChartData} color="#22c55e" height={80} label="Tokens / bucket" formatValue={formatNumber} />
            </div>
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>Models Overview</h3>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>Model</th><th>Provider</th><th>Requests</th><th>Avg Latency</th><th>P95</th><th>Error %</th><th>Input Tok</th><th>Output Tok</th><th>Tok/s</th></tr></thead>
                  <tbody>
                    {(models.data ?? []).map((m) => (
                      <tr key={m.model} className={styles.clickRow} onClick={() => navigate({ to: `/ai-models/${encodeURIComponent(m.model)}` as any })}>
                        <td className={styles.mono}>{m.model}</td>
                        <td>{m.provider}</td>
                        <td>{formatNumber(m.requestCount)}</td>
                        <td>{formatMs(m.avgLatencyMs)}</td>
                        <td>{formatMs(m.p95Ms)}</td>
                        <td>{formatPercent(m.errorRate)}</td>
                        <td>{formatNumber(m.inputTokens)}</td>
                        <td>{formatNumber(m.outputTokens)}</td>
                        <td>{m.tokensPerSec.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === "cost" && (
          <>
            {/* Cost & Token charts */}
            <div className={styles.gridTwo}>
              <div className={styles.panel}>
                <h3 className={styles.panelTitle}>Cost Trend</h3>
                <AiMiniChart data={costChartData} color="#f59e0b" height={96} label="Est. Cost / bucket" formatValue={(v) => formatCost(v)} />
              </div>
              <div className={styles.panel}>
                <h3 className={styles.panelTitle}>Token Usage</h3>
                <AiMultiSeriesChart
                  series={tokenChartSeries.map((s) => ({
                    ...s,
                    color: s.label === "Input Tokens" ? "#3b82f6" : "#22c55e",
                  }))}
                  height={96}
                />
              </div>
            </div>

            {/* Token Economics */}
            {tokenEconomics.data && (
              <div className={styles.statGrid}>
                <AiStatCard label="Total Input" value={formatNumber(tokenEconomics.data.totalInput)} />
                <AiStatCard label="Total Output" value={formatNumber(tokenEconomics.data.totalOutput)} />
                <AiStatCard label="I/O Ratio" value={tokenEconomics.data.inputOutputRatio.toFixed(2)} />
                <AiStatCard label="Avg Tokens/Req" value={formatNumber(tokenEconomics.data.avgTokensPerRequest)} />
                <AiStatCard label="Total Requests" value={formatNumber(tokenEconomics.data.requestCount)} />
              </div>
            )}

            {/* Finish Reason Trends */}
            {finishReasonSeries.length > 0 && (
              <div className={styles.panel}>
                <h3 className={styles.panelTitle}>Finish Reason Trends</h3>
                <AiMultiSeriesChart series={finishReasonSeries} height={80} />
              </div>
            )}
          </>
        )}

        {activeTab === "errors" && (
          <>
            {/* Error timeseries chart */}
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>Error Volume</h3>
              <AiMiniChart data={errorChartData} color="#ef4444" height={96} label="Errors / bucket" formatValue={formatNumber} />
            </div>

            {/* Error patterns with first/last seen (richer than topErrors) */}
            <div className={styles.panel}>
              <h3 className={styles.panelTitle}>Error Patterns</h3>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>Model</th><th>Operation</th><th>Message</th><th>Count</th><th>First Seen</th><th>Last Seen</th></tr></thead>
                  <tbody>
                    {(errorPatterns.data ?? []).map((e, i) => (
                      <tr key={i}>
                        <td className={styles.mono}>{e.model}</td>
                        <td>{e.operation}</td>
                        <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{e.statusMessage || "—"}</td>
                        <td className={styles.errorText}>{formatNumber(e.errorCount)}</td>
                        <td style={{ fontSize: 11 }}>{new Date(e.firstSeen).toLocaleString()}</td>
                        <td style={{ fontSize: 11 }}>{new Date(e.lastSeen).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(errorPatterns.data ?? []).length === 0 && <div className={styles.emptyState}>No error patterns found in this time range.</div>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---- Helpers ----

function aggregateTimeseries(points: AiTimeseriesPoint[]): { timestamp: string; value: number }[] {
  const map = new Map<string, number>();
  for (const p of points) {
    map.set(p.timestamp, (map.get(p.timestamp) ?? 0) + p.value);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([timestamp, value]) => ({ timestamp, value }));
}

function aggregateDualTimeseries(
  points: AiTimeseriesDualPoint[],
  label1: string,
  label2: string,
): { label: string; data: { timestamp: string; value: number }[] }[] {
  const map1 = new Map<string, number>();
  const map2 = new Map<string, number>();
  for (const p of points) {
    map1.set(p.timestamp, (map1.get(p.timestamp) ?? 0) + p.value1);
    map2.set(p.timestamp, (map2.get(p.timestamp) ?? 0) + p.value2);
  }
  const toArr = (m: Map<string, number>) =>
    [...m.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([timestamp, value]) => ({ timestamp, value }));
  return [
    { label: label1, data: toArr(map1) },
    { label: label2, data: toArr(map2) },
  ];
}
