import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";
import { useDeploymentMarkers } from "@shared/components/ui/charts/helpers/useDeploymentMarkers";
import { HubChartCard } from "@/features/overview/pages/OverviewHubPage/HubChartCard";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import SectionShell from "./SectionShell";
import { useGoldenSignals } from "./useGoldenSignals";

interface GoldenSignalsSectionProps {
  readonly serviceName: string;
}

interface ChartCardProps {
  readonly title: string;
  readonly description: string;
  readonly points: ReadonlyArray<{ timestamp: number; value: number }>;
  readonly color: string;
  readonly label: string;
  readonly formatter: (value: number) => string;
  readonly plugins: Parameters<typeof ObservabilityChart>[0]["plugins"];
}

function SignalChart({
  title,
  description,
  points,
  color,
  label,
  formatter,
  plugins,
}: ChartCardProps) {
  const timestamps = points.map((point) => point.timestamp);
  const series = [{ label, color, values: points.map((point) => point.value) }];
  return (
    <HubChartCard title={title} description={description}>
      <ObservabilityChart
        timestamps={timestamps}
        series={series}
        yFormatter={formatter}
        plugins={plugins}
        height={220}
      />
    </HubChartCard>
  );
}

export default function GoldenSignalsSection({ serviceName }: GoldenSignalsSectionProps) {
  const { requests, errorRate, latency } = useGoldenSignals(serviceName);
  const { plugin } = useDeploymentMarkers(serviceName);
  const plugins = [plugin];

  return (
    <SectionShell
      id="golden-signals"
      title="Golden signals"
      description="Request rate, error rate, and p95 latency with deployment markers overlaid."
    >
      <div className="grid gap-3 lg:grid-cols-3">
        <SignalChart
          title="Request rate"
          description="Requests per time bucket."
          points={requests}
          color="var(--color-primary)"
          label="Requests"
          formatter={(value) => formatNumber(value)}
          plugins={plugins}
        />
        <SignalChart
          title="Error rate"
          description="Errors as % of total requests."
          points={errorRate}
          color="var(--color-error)"
          label="Error %"
          formatter={(value) => formatPercentage(value)}
          plugins={plugins}
        />
        <SignalChart
          title="p95 latency"
          description="95th percentile duration."
          points={latency}
          color="var(--color-warning)"
          label="p95"
          formatter={(value) => formatDuration(value)}
          plugins={plugins}
        />
      </div>
    </SectionShell>
  );
}
