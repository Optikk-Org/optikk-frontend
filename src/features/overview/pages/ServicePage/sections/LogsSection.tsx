import CorrelatedErrorLogsList from "./CorrelatedErrorLogsList";
import SectionShell from "./SectionShell";

interface LogsSectionProps {
  readonly serviceName: string;
}

export default function LogsSection({ serviceName }: LogsSectionProps) {
  return (
    <SectionShell
      id="logs"
      title="Logs"
      description="Recent ERROR/FATAL severity logs for this service. Open explorer for the full view."
    >
      <CorrelatedErrorLogsList serviceName={serviceName} />
    </SectionShell>
  );
}
