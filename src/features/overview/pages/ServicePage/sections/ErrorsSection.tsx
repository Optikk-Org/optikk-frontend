import Http5xxByRouteTable from "./Http5xxByRouteTable";
import LatencyDuringErrorsChart from "./LatencyDuringErrorsChart";
import SectionShell from "./SectionShell";

interface ErrorsSectionProps {
  readonly serviceName: string;
}

export default function ErrorsSection({ serviceName }: ErrorsSectionProps) {
  return (
    <SectionShell
      id="errors"
      title="Errors"
      description="HTTP 5xx routes and p95 latency during error windows vs normal windows."
    >
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            HTTP 5xx by route
          </div>
          <Http5xxByRouteTable serviceName={serviceName} />
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Latency during error windows
          </div>
          <LatencyDuringErrorsChart serviceName={serviceName} />
        </div>
      </div>
    </SectionShell>
  );
}
