import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";
import { CHART_COLORS } from "@config/constants";

import type { DeploymentsTimeline } from "./useServiceDeployments";

interface VersionTrafficChartProps {
  readonly timeline: DeploymentsTimeline;
  readonly loading: boolean;
}

function colorFor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

export default function VersionTrafficChart({ timeline, loading }: VersionTrafficChartProps) {
  if (loading && timeline.timestamps.length === 0) {
    return <div className="text-[12px] text-[var(--text-muted)]">Loading version traffic…</div>;
  }

  if (timeline.timestamps.length === 0 || timeline.series.length === 0) {
    return (
      <div className="text-[12px] text-[var(--text-muted)]">
        No deployments recorded in this range.
      </div>
    );
  }

  const series = timeline.series.map((entry, index) => ({
    label: entry.label,
    values: entry.values,
    color: colorFor(index),
    width: 1.8,
  }));

  return (
    <ObservabilityChart
      timestamps={timeline.timestamps}
      series={series}
      yFormatter={(value) => `${value.toFixed(value >= 10 ? 0 : 2)} rps`}
      legend
      height={220}
    />
  );
}
