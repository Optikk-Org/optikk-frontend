import RecentErrorTracesList from "./RecentErrorTracesList";
import SectionShell from "./SectionShell";

interface TracesSectionProps {
  readonly serviceName: string;
}

export default function TracesSection({ serviceName }: TracesSectionProps) {
  return (
    <SectionShell
      id="traces"
      title="Traces"
      description="Recent error traces for this service. Click a row to inspect the full trace."
    >
      <RecentErrorTracesList serviceName={serviceName} />
    </SectionShell>
  );
}
