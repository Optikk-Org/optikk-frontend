import LatestDeploymentCard from "./LatestDeploymentCard";
import SectionShell from "./SectionShell";
import VersionTrafficChart from "./VersionTrafficChart";
import { useServiceDeployments } from "./useServiceDeployments";

interface DeploymentsSectionProps {
  readonly serviceName: string;
}

export default function DeploymentsSection({ serviceName }: DeploymentsSectionProps) {
  const { latestByService, timeline, loading } = useServiceDeployments(serviceName);

  return (
    <SectionShell
      id="deployments"
      title="Deployments"
      description="Version traffic over time and the active release for this service."
    >
      <div className="grid gap-3 xl:grid-cols-[2fr_1fr]">
        <VersionTrafficChart timeline={timeline} loading={loading} />
        <LatestDeploymentCard latest={latestByService} />
      </div>
    </SectionShell>
  );
}
