import { GitCompare } from "lucide-react";
import { memo } from "react";

import { Badge } from "@shared/components/primitives/ui";
import { DrawerClose, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { formatRelativeTime } from "@shared/utils/formatters";

import type { DeploymentSeed } from "../types";

interface Props {
  title?: string | null;
  seed: DeploymentSeed | null;
}

function DeploymentCompareHeaderComponent({ title, seed }: Props) {
  return (
    <DrawerHeader className="items-start border-[var(--border-color)] border-b bg-[linear-gradient(180deg,var(--color-primary-subtle-15),var(--color-primary-subtle-02))]">
      <div className="flex w-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <DrawerTitle className="flex items-center gap-2 text-[var(--text-primary)]">
              <GitCompare size={18} className="shrink-0" />
              <span className="truncate">
                {title || seed?.serviceName || "Deployment compare"}
              </span>
            </DrawerTitle>
            <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
              Compare release impact across error hotspots, endpoint latency, and traffic shape.
            </p>
            <p className="mt-2 text-[11px] text-[var(--text-muted)] leading-relaxed">
              For CI or build logs, use the log explorer with attributes such as{" "}
              <code className="rounded bg-[var(--bg-tertiary)] px-1">optik.ci.pipeline</code> or{" "}
              <code className="rounded bg-[var(--bg-tertiary)] px-1">git.commit.sha</code> when
              your pipeline emits them (see{" "}
              <span className="text-[var(--text-secondary)]">docs/telemetry-contracts.md</span>).
              Quick links below open service-scoped logs/traces for the selected window.
            </p>
          </div>
          <DrawerClose
            aria-label="Close"
            className="shrink-0 rounded-[var(--card-radius)] border border-[var(--border-color)] px-3 py-1 text-[18px] text-[var(--text-secondary)] leading-none transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
          >
            &times;
          </DrawerClose>
        </div>

        {seed ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">{seed.version}</Badge>
            <Badge variant="default">{seed.environment || "unknown env"}</Badge>
            <Badge variant={seed.isActive ? "success" : "warning"}>
              {seed.isActive ? "Active release" : "Historical release"}
            </Badge>
            <span className="text-[12px] text-[var(--text-secondary)]">
              deployed {formatRelativeTime(seed.deployedAtMs)}
            </span>
            {seed.lastSeenAtMs ? (
              <span className="text-[12px] text-[var(--text-muted)]">
                last seen {formatRelativeTime(seed.lastSeenAtMs)}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </DrawerHeader>
  );
}

export const DeploymentCompareHeader = memo(DeploymentCompareHeaderComponent);
