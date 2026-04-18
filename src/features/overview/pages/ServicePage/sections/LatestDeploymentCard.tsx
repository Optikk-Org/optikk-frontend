import { Badge, Card } from "@shared/components/primitives/ui";
import { formatRelativeTime } from "@shared/utils/formatters";

import type { ServiceLatestDeployment } from "@/features/overview/api/deploymentsApi";

interface LatestDeploymentCardProps {
  readonly latest: ServiceLatestDeployment | null;
}

export default function LatestDeploymentCard({ latest }: LatestDeploymentCardProps) {
  if (!latest) {
    return (
      <Card padding="md" className="border-[rgba(255,255,255,0.07)]">
        <div className="text-[12px] text-[var(--text-muted)]">
          No active deployment recorded for this service.
        </div>
      </Card>
    );
  }

  return (
    <Card padding="md" className="border-[rgba(255,255,255,0.07)]">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="info">{latest.version}</Badge>
        <Badge variant="default">{latest.environment || "unknown env"}</Badge>
        <Badge variant={latest.is_active ? "success" : "warning"}>
          {latest.is_active ? "Active" : "Historical"}
        </Badge>
      </div>
      <div className="mt-2 text-[12px] text-[var(--text-secondary)]">
        Deployed {formatRelativeTime(latest.deployed_at)}
      </div>
      {latest.last_seen_at ? (
        <div className="mt-1 text-[11px] text-[var(--text-muted)]">
          Last seen {formatRelativeTime(latest.last_seen_at)}
        </div>
      ) : null}
    </Card>
  );
}
