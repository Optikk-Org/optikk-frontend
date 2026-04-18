import { useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

import {
  buildServiceLogsSearch,
  buildServiceTracesSearch,
} from "@/features/overview/components/serviceDrawerState";
import { ROUTES } from "@/shared/constants/routes";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";

export function useServiceNavigation(serviceName: string): {
  openTraces: () => void;
  openLogs: () => void;
} {
  const navigate = useNavigate();
  const location = useLocation();

  const openTraces = useCallback(() => {
    navigate(
      dynamicNavigateOptions(ROUTES.traces, buildServiceTracesSearch(location.search, serviceName))
    );
  }, [location.search, navigate, serviceName]);

  const openLogs = useCallback(() => {
    navigate(
      dynamicNavigateOptions(ROUTES.logs, buildServiceLogsSearch(location.search, serviceName))
    );
  }, [location.search, navigate, serviceName]);

  return { openTraces, openLogs };
}
