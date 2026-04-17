import { Activity, Cable, FileText, Layers3, TimerReset } from "lucide-react";
import { memo } from "react";

import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import type { DatastoreOverview } from "../../../api/saturationApi";
import { SaturationStatTile } from "../../../components/SaturationStatTile";

interface Props {
  overview?: DatastoreOverview;
}

function DatastoreStatTilesComponent({ overview }: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
      <SaturationStatTile
        label="Queries"
        value={formatNumber(overview?.query_count ?? 0)}
        meta="Total operations in range"
        icon={<Activity size={16} />}
      />
      <SaturationStatTile
        label="Err %"
        value={formatPercentage(overview?.error_rate ?? 0)}
        meta="System-wide error rate"
        icon={<TimerReset size={16} />}
      />
      <SaturationStatTile
        label="P95"
        value={formatDuration(overview?.p95_latency_ms ?? 0)}
        meta={`P99 ${formatDuration(overview?.p99_latency_ms ?? 0)}`}
        icon={<TimerReset size={16} />}
      />
      <SaturationStatTile
        label="Connections"
        value={formatNumber(overview?.active_connections ?? 0)}
        meta="Active pool usage"
        icon={<Cable size={16} />}
      />
      <SaturationStatTile
        label="Namespaces"
        value={formatNumber(overview?.namespace_count ?? 0)}
        meta={`Collections ${formatNumber(overview?.collection_count ?? 0)}`}
        icon={<Layers3 size={16} />}
      />
      <SaturationStatTile
        label="Read/Write"
        value={`${formatNumber(overview?.read_ops_per_sec ?? 0)}/${formatNumber(overview?.write_ops_per_sec ?? 0)}`}
        meta="Read ops per sec / write ops per sec"
        icon={<FileText size={16} />}
      />
    </div>
  );
}

export const DatastoreStatTiles = memo(DatastoreStatTilesComponent);
