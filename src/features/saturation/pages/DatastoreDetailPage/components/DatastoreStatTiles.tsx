import { memo, useMemo } from "react";

import type { DatastoreOverview } from "../../../api/saturationApi";
import { SaturationStatTile } from "../../../components/SaturationStatTile";

import { buildDatastoreStatTiles } from "./statTileDefinitions";

interface Props {
  overview?: DatastoreOverview;
}

function DatastoreStatTilesComponent({ overview }: Props) {
  const tiles = useMemo(() => buildDatastoreStatTiles(overview), [overview]);
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
      {tiles.map((tile) => (
        <SaturationStatTile key={tile.label} {...tile} />
      ))}
    </div>
  );
}

export const DatastoreStatTiles = memo(DatastoreStatTilesComponent);
