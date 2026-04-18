import StatCard from "@shared/components/ui/cards/StatCard";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import type { ServiceSummaryMetrics } from "./useServiceSummary";

interface ServiceKpiStripProps {
  readonly summary: ServiceSummaryMetrics | null;
  readonly loading: boolean;
}

interface KpiSpec {
  readonly title: string;
  readonly value: number;
  readonly formatter: (value: number | string) => string;
}

function buildKpis(summary: ServiceSummaryMetrics | null): KpiSpec[] {
  const safe = summary ?? {
    requestCount: 0,
    errorCount: 0,
    errorRatePct: 0,
    p50: 0,
    p95: 0,
    p99: 0,
  };
  return [
    { title: "Requests", value: safe.requestCount, formatter: (v) => formatNumber(v) },
    { title: "Error rate", value: safe.errorRatePct, formatter: (v) => formatPercentage(v) },
    { title: "p50 latency", value: safe.p50, formatter: (v) => formatDuration(v) },
    { title: "p95 latency", value: safe.p95, formatter: (v) => formatDuration(v) },
    { title: "p99 latency", value: safe.p99, formatter: (v) => formatDuration(v) },
  ];
}

export default function ServiceKpiStrip({ summary, loading }: ServiceKpiStripProps) {
  const kpis = buildKpis(summary);
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
      {kpis.map((kpi) => (
        <StatCard
          key={kpi.title}
          metric={{ title: kpi.title, value: kpi.value, formatter: kpi.formatter }}
          visuals={{ loading }}
        />
      ))}
    </div>
  );
}
