import { memo } from "react";

import { PageSurface } from "@shared/components/ui";
import type Flamegraph from "@shared/components/ui/charts/specialized/Flamegraph";
import WaterfallChart from "@shared/components/ui/charts/specialized/WaterfallChart";

import { useTracesStore } from "../../../store/tracesStore";
import { FlamegraphBody } from "./visualization/FlamegraphBody";
import { VisualizationHeader } from "./visualization/VisualizationHeader";
import { VisualizationTabs, type TabKey } from "./visualization/VisualizationTabs";

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

function TraceDetailVisualizationComponent(props: Props) {
  const { activeTab, onActiveTabChange } = props;
  const search = useTracesStore((s) => s.waterfallSearch);
  const setSearch = useTracesStore((s) => s.setWaterfallSearch);
  const errorsOnly = useTracesStore((s) => s.waterfallErrorsOnly);
  const setErrorsOnly = useTracesStore((s) => s.setWaterfallErrorsOnly);
  const collapsed = useTracesStore((s) => s.collapsedSpanIds);
  const toggleCollapsed = useTracesStore((s) => s.toggleCollapsedSpan);
  return (
    <PageSurface>
      <VisualizationHeader />
      <VisualizationTabs activeTab={activeTab} onChange={onActiveTabChange} />
      {activeTab === "timeline" ? (
        <WaterfallChart
          spans={props.spans}
          onSpanClick={props.onSpanClick}
          selectedSpanId={props.selectedSpanId}
          criticalPathSpanIds={props.criticalPathSpanIds}
          errorPathSpanIds={props.errorPathSpanIds}
          search={search}
          onSearchChange={setSearch}
          errorsOnly={errorsOnly}
          onErrorsOnlyChange={setErrorsOnly}
          collapsedSpanIds={collapsed}
          onToggleCollapse={toggleCollapsed}
        />
      ) : (
        <FlamegraphBody
          data={props.flamegraphData}
          loading={props.flamegraphLoading}
          error={props.flamegraphError}
        />
      )}
    </PageSurface>
  );
}

export const TraceDetailVisualization = memo(TraceDetailVisualizationComponent);
