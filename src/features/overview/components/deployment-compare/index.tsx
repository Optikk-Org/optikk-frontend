import { useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { ROUTES } from "@/shared/constants/routes";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";
import { useAppStore } from "@app/store/appStore";

import { buildServiceLogsSearch, buildServiceTracesSearch } from "../serviceDrawerState";

import { DeploymentCompareEndpoints } from "./components/DeploymentCompareEndpoints";
import { DeploymentCompareErrors } from "./components/DeploymentCompareErrors";
import { DeploymentCompareHeader } from "./components/DeploymentCompareHeader";
import { DeploymentCompareSummary } from "./components/DeploymentCompareSummary";
import { DeploymentCompareTimeline } from "./components/DeploymentCompareTimeline";
import { DeploymentCompareWindow } from "./components/DeploymentCompareWindow";
import { useDeploymentCompare } from "./hooks/useDeploymentCompare";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string | null;
  initialData?: Record<string, unknown> | null;
}

export default function DeploymentCompareDrawer({
  open,
  onClose,
  title,
  initialData,
}: Props): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const setCustomTimeRange = useAppStore((state) => state.setCustomTimeRange);

  const { seed, compare, compareQuery, timelineQuery, timeline } =
    useDeploymentCompare(initialData);

  const openSurface = useCallback(
    (target: "logs" | "traces", startMs: number, endMs: number) => {
      if (!seed?.serviceName) return;
      setCustomTimeRange(startMs, endMs, "Deployment comparison");
      navigate(
        dynamicNavigateOptions(
          target === "logs" ? ROUTES.logs : ROUTES.traces,
          target === "logs"
            ? buildServiceLogsSearch(location.search, seed.serviceName)
            : buildServiceTracesSearch(location.search, seed.serviceName)
        )
      );
    },
    [location.search, navigate, seed?.serviceName, setCustomTimeRange]
  );

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      direction="right"
    >
      <DrawerContent
        className="top-[var(--space-header-h,56px)] right-0 bottom-0 left-auto z-[1100] h-auto select-text overflow-y-auto border-[var(--border-color)] border-l"
        style={{ width: "min(1120px, calc(100vw - 20px))" }}
      >
        <DeploymentCompareHeader title={title} seed={seed} />

        {!seed ? (
          <div className="px-6 py-6 text-[13px] text-[var(--text-muted)]">
            Deployment metadata is missing, so the compare view cannot be opened from this link.
          </div>
        ) : compareQuery.isLoading ? (
          <div className="px-6 py-6 text-[13px] text-[var(--text-muted)]">
            Loading deployment comparison…
          </div>
        ) : compareQuery.isError ? (
          <div className="px-6 py-6 text-[13px] text-[var(--color-error)]">
            Deployment comparison is unavailable right now.
          </div>
        ) : !compare ? (
          <div className="px-6 py-6 text-[13px] text-[var(--text-muted)]">
            No deployment comparison data was returned for this release.
          </div>
        ) : (
          <div className="flex flex-col gap-5 px-6 py-5">
            <DeploymentCompareSummary compare={compare} />
            <DeploymentCompareWindow compare={compare} onOpen={openSurface} />
            <DeploymentCompareTimeline
              compare={compare}
              isLoading={timelineQuery.isLoading}
              timeline={timeline}
            />
            <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <DeploymentCompareErrors compare={compare} />
              <DeploymentCompareEndpoints compare={compare} />
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
