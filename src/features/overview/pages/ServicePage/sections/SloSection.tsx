import ApdexCard from "./ApdexCard";
import SectionShell from "./SectionShell";
import SloStatsCard from "./SloStatsCard";

interface SloSectionProps {
  readonly serviceName: string;
}

export default function SloSection({ serviceName }: SloSectionProps) {
  return (
    <SectionShell
      id="slo"
      title="SLO & Apdex"
      description="Service-level indicator from configured SLO and Apdex user-satisfaction score."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <SloStatsCard serviceName={serviceName} />
        <ApdexCard serviceName={serviceName} />
      </div>
    </SectionShell>
  );
}
