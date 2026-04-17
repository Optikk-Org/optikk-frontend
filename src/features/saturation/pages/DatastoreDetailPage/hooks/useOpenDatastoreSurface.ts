import { useLocation, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

import { ROUTES } from "@/shared/constants/routes";
import type { StructuredFilter } from "@/shared/hooks/useURLFilters";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";

import {
  buildSaturationLogsSearch,
  buildSaturationTracesSearch,
} from "../../../components/navigation";

export function useOpenDatastoreSurface(system: string) {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (target: "logs" | "traces") => {
      const filters: StructuredFilter[] =
        target === "logs"
          ? [{ field: "db.system", operator: "equals", value: system }]
          : [{ field: "db_system", operator: "equals", value: system }];
      const search =
        target === "logs"
          ? buildSaturationLogsSearch(location.search, filters)
          : buildSaturationTracesSearch(location.search, filters);
      navigate(dynamicNavigateOptions(target === "logs" ? ROUTES.logs : ROUTES.traces, search));
    },
    [location.search, navigate, system]
  );
}
