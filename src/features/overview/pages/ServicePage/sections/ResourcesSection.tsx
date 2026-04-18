import SectionShell from "./SectionShell";
import TopEndpointsTable from "./TopEndpointsTable";

interface ResourcesSectionProps {
  readonly serviceName: string;
}

export default function ResourcesSection({ serviceName }: ResourcesSectionProps) {
  return (
    <SectionShell
      id="resources"
      title="Resources"
      description="Top endpoints by request volume with error rate and p95 latency."
    >
      <TopEndpointsTable serviceName={serviceName} />
    </SectionShell>
  );
}
