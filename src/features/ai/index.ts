import { BrainCircuit } from "lucide-react";
import { lazy } from "react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

const AIExplorerPage = lazy(() =>
  import("./pages/AIExplorerPage").then((module) => ({ default: module.default }))
);

export const aiConfig: DomainConfig = {
  key: "ai",
  label: "AI",
  permissions: ["ai:read"],
  navigation: [
    {
      path: ROUTES.ai,
      label: "AI",
      icon: BrainCircuit,
      group: "observe",
    },
  ],
  routes: [{ path: ROUTES.ai, page: AIExplorerPage }],
  dashboardPanels: [],
};
