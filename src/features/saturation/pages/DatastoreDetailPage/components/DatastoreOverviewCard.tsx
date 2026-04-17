import { memo } from "react";

import { PageSurface } from "@shared/components/ui";

import type { DatastoreOverview } from "../../../api/saturationApi";

import { DatastoreOverviewHeader } from "./DatastoreOverviewHeader";
import { DatastoreTopCollections } from "./DatastoreTopCollections";

interface Props {
  overview?: DatastoreOverview;
}

function DatastoreOverviewCardComponent({ overview }: Props) {
  return (
    <PageSurface padding="lg">
      <DatastoreOverviewHeader overview={overview} />
      <DatastoreTopCollections collections={overview?.top_collections ?? []} />
    </PageSurface>
  );
}

export const DatastoreOverviewCard = memo(DatastoreOverviewCardComponent);
