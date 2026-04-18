import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";
import { formatDuration } from "@shared/utils/formatters";

import { useLatencyDuringErrors } from "./useLatencyDuringErrors";

interface LatencyDuringErrorsChartProps {
  readonly serviceName: string;
}

export default function LatencyDuringErrorsChart({ serviceName }: LatencyDuringErrorsChartProps) {
  const { points, loading } = useLatencyDuringErrors(serviceName);

  if (loading && points.length === 0) {
    return <div className="text-[12px] text-[var(--text-muted)]">Loading latency comparison…</div>;
  }

  if (points.length === 0) {
    return (
      <div className="text-[12px] text-[var(--text-muted)]">
        No error windows recorded in this range.
      </div>
    );
  }

  const timestamps = points.map((point) => point.timestamp);
  const series = [
    {
      label: "p95 during errors",
      color: "var(--color-error)",
      values: points.map((point) => point.inError),
    },
    {
      label: "p95 normal",
      color: "var(--color-primary)",
      values: points.map((point) => point.inNormal),
      dash: [4, 3],
    },
  ];

  return (
    <ObservabilityChart
      timestamps={timestamps}
      series={series}
      yFormatter={(value) => formatDuration(value)}
      legend
      height={220}
    />
  );
}
