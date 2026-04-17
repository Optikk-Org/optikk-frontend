import { Tabs } from "@/components/ui";
import { memo } from "react";

import { PageSurface } from "@shared/components/ui";
import Flamegraph from "@shared/components/ui/charts/specialized/Flamegraph";
import WaterfallChart from "@shared/components/ui/charts/specialized/WaterfallChart";

type TabKey = "timeline" | "flamegraph";

interface Props {
  activeTab: TabKey;
  onActiveTabChange: (next: TabKey) => void;
  spans: Parameters<typeof WaterfallChart>[0]["spans"];
  selectedSpanId: string | null;
  onSpanClick: Parameters<typeof WaterfallChart>[0]["onSpanClick"];
  criticalPathSpanIds: Set<string>;
  errorPathSpanIds: Set<string>;
  flamegraphData: Parameters<typeof Flamegraph>[0]["data"] | null;
  flamegraphLoading: boolean;
  flamegraphError: boolean;
}

function TraceDetailVisualizationComponent({
  activeTab,
  onActiveTabChange,
  spans,
  selectedSpanId,
  onSpanClick,
  criticalPathSpanIds,
  errorPathSpanIds,
  flamegraphData,
  flamegraphLoading,
  flamegraphError,
}: Props) {
  return (
    <PageSurface>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-[var(--text-primary)] text-base">
            Trace Visualization
          </h2>
          <p className="mt-1 text-[var(--text-secondary)] text-sm">
            Switch between timeline and flamegraph views without leaving the trace context.
          </p>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(next) => onActiveTabChange(next as TabKey)}
        items={[
          { key: "timeline", label: "Trace Timeline" },
          { key: "flamegraph", label: "Flamegraph" },
        ]}
        size="lg"
        className="mt-4 mb-4"
      />

      {activeTab === "timeline" ? (
        <WaterfallChart
          spans={spans}
          onSpanClick={onSpanClick}
          selectedSpanId={selectedSpanId}
          criticalPathSpanIds={criticalPathSpanIds}
          errorPathSpanIds={errorPathSpanIds}
        />
      ) : flamegraphLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="ok-spinner" />
        </div>
      ) : flamegraphError ? (
        <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-8 text-center text-[var(--text-muted)] text-sm">
          Could not load flamegraph data for this trace.
        </div>
      ) : flamegraphData ? (
        <Flamegraph data={flamegraphData} />
      ) : (
        <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-8 text-center text-[var(--text-muted)] text-sm">
          No flamegraph data available for this trace.
        </div>
      )}
    </PageSurface>
  );
}

export const TraceDetailVisualization = memo(TraceDetailVisualizationComponent);
