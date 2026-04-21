import { Gauge } from "lucide-react";
import { lazy } from "react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

// Eager import: the route uses Suspense with a fullscreen Loading fallback; lazy() for this page
// can strand users on "Loading..." if the chunk never resolves (dev/HMR or failed network load).
import SaturationPage from "./pages/SaturationPage";
const DatastoreDetailPage = lazy(() =>
  import("./pages/DatastoreDetailPage").then((module) => ({ default: module.default }))
);
const KafkaTopicDetailPage = lazy(() =>
  import("./pages/KafkaTopicDetailPage").then((module) => ({ default: module.default }))
);
const KafkaGroupDetailPage = lazy(() =>
  import("./pages/KafkaGroupDetailPage").then((module) => ({ default: module.default }))
);

export const saturationConfig: DomainConfig = {
  key: "saturation",
  label: "Saturation",
  permissions: ["saturation:read"],
  navigation: [
    {
      path: ROUTES.saturation,
      label: "Saturation",
      icon: Gauge,
      group: "operate",
    },
  ],
  routes: [
    { path: ROUTES.saturationDatastoreDetail, page: DatastoreDetailPage },
    { path: ROUTES.saturationKafkaTopicDetail, page: KafkaTopicDetailPage },
    { path: ROUTES.saturationKafkaGroupDetail, page: KafkaGroupDetailPage },
    { path: ROUTES.saturation, page: SaturationPage },
  ],
  dashboardPanels: [],
};
