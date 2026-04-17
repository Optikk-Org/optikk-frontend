import type { ReactNode } from "react";

import { Activity, Cable, FileText, Layers3, TimerReset } from "lucide-react";
import { createElement } from "react";

import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import type { DatastoreOverview } from "../../../api/saturationApi";

export interface StatTileSpec {
  label: string;
  value: string;
  meta: string;
  icon: ReactNode;
}

export function buildDatastoreStatTiles(overview?: DatastoreOverview): StatTileSpec[] {
  return [
    {
      label: "Queries",
      value: formatNumber(overview?.query_count ?? 0),
      meta: "Total operations in range",
      icon: createElement(Activity, { size: 16 }),
    },
    {
      label: "Err %",
      value: formatPercentage(overview?.error_rate ?? 0),
      meta: "System-wide error rate",
      icon: createElement(TimerReset, { size: 16 }),
    },
    {
      label: "P95",
      value: formatDuration(overview?.p95_latency_ms ?? 0),
      meta: `P99 ${formatDuration(overview?.p99_latency_ms ?? 0)}`,
      icon: createElement(TimerReset, { size: 16 }),
    },
    {
      label: "Connections",
      value: formatNumber(overview?.active_connections ?? 0),
      meta: "Active pool usage",
      icon: createElement(Cable, { size: 16 }),
    },
    {
      label: "Namespaces",
      value: formatNumber(overview?.namespace_count ?? 0),
      meta: `Collections ${formatNumber(overview?.collection_count ?? 0)}`,
      icon: createElement(Layers3, { size: 16 }),
    },
    {
      label: "Read/Write",
      value: `${formatNumber(overview?.read_ops_per_sec ?? 0)}/${formatNumber(overview?.write_ops_per_sec ?? 0)}`,
      meta: "Read ops per sec / write ops per sec",
      icon: createElement(FileText, { size: 16 }),
    },
  ];
}
