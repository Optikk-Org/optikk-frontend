import { ArrowUpRight, GitBranch, Radar } from "lucide-react";
import { memo } from "react";

import type { DeploymentCompareResponse } from "@/features/overview/api/deploymentsApi";
import { Button, Card } from "@shared/components/primitives/ui";

import { formatWindowLabel } from "../utils";

interface Props {
  compare: DeploymentCompareResponse;
  onOpen: (target: "logs" | "traces", startMs: number, endMs: number) => void;
}

function DeploymentCompareWindowComponent({ compare, onOpen }: Props) {
  const { before_window: before, after_window: after } = compare;

  return (
    <Card padding="lg" className="border-[rgba(255,255,255,0.07)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radar size={16} className="text-[var(--color-primary)]" />
            <h3 className="font-semibold text-[var(--text-primary)]">Deployment window</h3>
          </div>
          <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
            {compare.has_baseline && before
              ? `Before: ${formatWindowLabel(before.start_ms, before.end_ms)}`
              : "No prior deployment baseline exists for this release."}
          </p>
          <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
            After: {formatWindowLabel(after.start_ms, after.end_ms)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {before ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                icon={<GitBranch size={14} />}
                onClick={() => onOpen("traces", before.start_ms, before.end_ms)}
              >
                Traces before
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<ArrowUpRight size={14} />}
                onClick={() => onOpen("logs", before.start_ms, before.end_ms)}
              >
                Logs before
              </Button>
            </>
          ) : null}
          <Button
            variant="secondary"
            size="sm"
            icon={<GitBranch size={14} />}
            onClick={() => onOpen("traces", after.start_ms, after.end_ms)}
          >
            Traces after
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowUpRight size={14} />}
            onClick={() => onOpen("logs", after.start_ms, after.end_ms)}
          >
            Logs after
          </Button>
        </div>
      </div>
    </Card>
  );
}

export const DeploymentCompareWindow = memo(DeploymentCompareWindowComponent);
