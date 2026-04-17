import { memo } from "react";

import { NAMESPACE_COLUMNS, SERVER_COLUMNS } from "../../columns";
import type { useDatastoreData } from "../../hooks/useDatastoreData";
import { DatastoreTableCard } from "../DatastoreTableCard";

type Bundle = ReturnType<typeof useDatastoreData>;

function ServersAndNamespacesRowComponent({ bundle }: { bundle: Bundle }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <DatastoreTableCard
        eyebrow="Servers"
        title="Instance latency"
        rows={bundle.serversQuery.data ?? []}
        columns={SERVER_COLUMNS}
        rowKey={(row) => row.server}
        pageSize={8}
        scrollX={640}
      />
      <DatastoreTableCard
        eyebrow="Namespaces"
        title="Active namespaces / collections"
        rows={bundle.namespacesQuery.data ?? []}
        columns={NAMESPACE_COLUMNS}
        rowKey={(row) => row.namespace}
        pageSize={8}
        scrollX={480}
      />
    </div>
  );
}

export const ServersAndNamespacesRow = memo(ServersAndNamespacesRowComponent);
