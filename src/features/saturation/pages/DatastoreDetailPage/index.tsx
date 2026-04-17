import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { Database } from "lucide-react";
import { useCallback } from "react";

import {
  Badge,
  Button,
} from "@shared/components/primitives/ui";
import { PageHeader, PageShell } from "@shared/components/ui";
import { formatTimestamp } from "@shared/utils/formatters";

import { ROUTES } from "@/shared/constants/routes";
import type { StructuredFilter } from "@/shared/hooks/useURLFilters";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";

import {
  buildSaturationLogsSearch,
  buildSaturationTracesSearch,
} from "../../components/navigation";

import {
  CONNECTION_COLUMNS,
  ERROR_COLUMNS,
  NAMESPACE_COLUMNS,
  OPERATION_COLUMNS,
  SERVER_COLUMNS,
  SLOW_QUERY_COLUMNS,
} from "./columns";
import { DatastoreOverviewCard } from "./components/DatastoreOverviewCard";
import { DatastoreStatTiles } from "./components/DatastoreStatTiles";
import { DatastoreTableCard } from "./components/DatastoreTableCard";
import { useDatastoreData } from "./hooks/useDatastoreData";

function categoryBadgeVariant(category: string): "info" | "warning" {
  return category === "redis" ? "warning" : "info";
}

export default function DatastoreDetailPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams({ strict: false });
  const system = decodeURIComponent(typeof params.system === "string" ? params.system : "");

  const {
    overviewQuery,
    serversQuery,
    namespacesQuery,
    operationsQuery,
    errorsQuery,
    connectionsQuery,
    slowQueriesQuery,
  } = useDatastoreData(system);

  const overview = overviewQuery.data;

  const openSurface = useCallback(
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

  return (
    <PageShell>
      <PageHeader
        title={system}
        subtitle="System-level datastore exploration with latency, contention, namespace, and slow-query context."
        icon={<Database size={24} />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={categoryBadgeVariant(overview?.category ?? "database")}>
              {overview?.category ?? "database"}
            </Badge>
            <Button size="sm" variant="secondary" onClick={() => openSurface("logs")}>
              Logs
            </Button>
            <Button size="sm" variant="secondary" onClick={() => openSurface("traces")}>
              Traces
            </Button>
          </div>
        }
      />

      <DatastoreStatTiles overview={overview} />
      <DatastoreOverviewCard overview={overview} />

      <div className="grid gap-4 xl:grid-cols-2">
        <DatastoreTableCard
          eyebrow="Servers"
          title="Instance latency"
          rows={serversQuery.data ?? []}
          columns={SERVER_COLUMNS}
          rowKey={(row) => row.server}
          pageSize={8}
          scrollX={640}
        />
        <DatastoreTableCard
          eyebrow="Namespaces"
          title="Active namespaces / collections"
          rows={namespacesQuery.data ?? []}
          columns={NAMESPACE_COLUMNS}
          rowKey={(row) => row.namespace}
          pageSize={8}
          scrollX={480}
        />
      </div>

      <DatastoreTableCard
        eyebrow="Operations"
        title="Latency and throughput by operation"
        rows={operationsQuery.data ?? []}
        columns={OPERATION_COLUMNS}
        rowKey={(row) => row.operation}
        pageSize={10}
        scrollX={820}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <DatastoreTableCard
          eyebrow="Errors"
          title="Error pressure by type"
          rows={errorsQuery.data ?? []}
          columns={ERROR_COLUMNS}
          rowKey={(row) => row.error_type}
          pageSize={8}
          scrollX={480}
        />
        <DatastoreTableCard
          eyebrow="Connections"
          title="Pool utilization"
          rows={connectionsQuery.data ?? []}
          columns={CONNECTION_COLUMNS}
          rowKey={(row) => row.pool_name}
          pageSize={8}
          scrollX={760}
        />
      </div>

      <DatastoreTableCard
        eyebrow="Slow Queries"
        title="Highest-latency query patterns"
        rows={slowQueriesQuery.data ?? []}
        columns={SLOW_QUERY_COLUMNS}
        rowKey={(row, index) => `${row.collection_name}-${index}`}
        pageSize={10}
        scrollX={980}
        rightAdornment={
          <div className="text-[11px] text-[var(--text-muted)]">
            Updated {formatTimestamp(Date.now())}
          </div>
        }
      />
    </PageShell>
  );
}
