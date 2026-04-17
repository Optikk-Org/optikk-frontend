import { memo, useMemo } from "react";

import type { DeploymentCompareResponse } from "@/features/overview/api/deploymentsApi";
import { Badge, Card } from "@shared/components/primitives/ui";
import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";

import type { TimelineSeries } from "../types";

interface Props {
  compare: DeploymentCompareResponse;
  isLoading: boolean;
  timeline: { timestamps: number[]; series: TimelineSeries[] } | null;
}

function DeploymentCompareTimelineComponent({ compare, isLoading, timeline }: Props) {
  const weightedSeries = useMemo(
    () =>
      timeline?.series.map((series) => ({
        ...series,
        width: series.label === compare.deployment.version ? 2.4 : 1.6,
      })) ?? null,
    [timeline, compare.deployment.version]
  );

  return (
    <Card padding="lg" className="border-[rgba(255,255,255,0.07)]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">Version traffic</h3>
          <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
            Release-centered traffic view across the baseline and post-deploy windows.
          </p>
        </div>
        <Badge variant="info">Release {compare.deployment.version}</Badge>
      </div>
      {isLoading ? (
        <div className="text-[12px] text-[var(--text-muted)]">Loading version traffic…</div>
      ) : timeline && weightedSeries ? (
        <div className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[rgba(15,18,25,0.35)] p-3">
          <ObservabilityChart
            timestamps={timeline.timestamps}
            series={weightedSeries}
            height={250}
            yFormatter={(value) => `${value.toFixed(value >= 10 ? 0 : 1)} rps`}
            legend
          />
        </div>
      ) : (
        <div className="text-[12px] text-[var(--text-muted)]">No version traffic was found.</div>
      )}
    </Card>
  );
}

export const DeploymentCompareTimeline = memo(DeploymentCompareTimelineComponent);
