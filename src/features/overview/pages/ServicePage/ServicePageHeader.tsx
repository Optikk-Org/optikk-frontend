import { LayoutDashboard, Share2 } from "lucide-react";

import { Badge, Button } from "@shared/components/primitives/ui";
import { PageHeader } from "@shared/components/ui";

import type { ActiveVersion } from "@/features/overview/api/deploymentsApi";

import type { ServiceSummaryMetrics } from "./useServiceSummary";

interface ServicePageHeaderProps {
  readonly serviceName: string;
  readonly activeVersion: ActiveVersion | null;
  readonly summary: ServiceSummaryMetrics | null;
  readonly onCopyShare: () => void;
  readonly onExportJson: () => void;
  readonly onOpenTraces: () => void;
  readonly onOpenLogs: () => void;
}

function healthTone(errorRatePct: number): {
  label: string;
  variant: "success" | "warning" | "error";
} {
  if (errorRatePct >= 5) return { label: "Unhealthy", variant: "error" };
  if (errorRatePct >= 1) return { label: "Degraded", variant: "warning" };
  return { label: "Healthy", variant: "success" };
}

function HeaderBadges({
  activeVersion,
  summary,
}: {
  activeVersion: ActiveVersion | null;
  summary: ServiceSummaryMetrics | null;
}) {
  const health = summary ? healthTone(summary.errorRatePct) : null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeVersion?.version ? <Badge variant="info">{activeVersion.version}</Badge> : null}
      {activeVersion?.environment ? (
        <Badge variant="default">{activeVersion.environment}</Badge>
      ) : null}
      {health ? <Badge variant={health.variant}>{health.label}</Badge> : null}
    </div>
  );
}

export default function ServicePageHeader({
  serviceName,
  activeVersion,
  summary,
  onCopyShare,
  onExportJson,
  onOpenTraces,
  onOpenLogs,
}: ServicePageHeaderProps) {
  return (
    <PageHeader
      title={serviceName}
      subtitle={<HeaderBadges activeVersion={activeVersion} summary={summary} />}
      icon={<LayoutDashboard size={24} />}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onOpenTraces}>
            View traces
          </Button>
          <Button variant="ghost" size="sm" onClick={onOpenLogs}>
            View logs
          </Button>
          <Button variant="ghost" size="sm" icon={<Share2 size={14} />} onClick={onCopyShare}>
            Copy link
          </Button>
          <Button variant="ghost" size="sm" onClick={onExportJson}>
            Export JSON
          </Button>
        </div>
      }
    />
  );
}
