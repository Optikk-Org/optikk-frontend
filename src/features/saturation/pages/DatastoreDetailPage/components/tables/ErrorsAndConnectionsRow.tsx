import { memo } from "react";

import { CONNECTION_COLUMNS, ERROR_COLUMNS } from "../../columns";
import type { useDatastoreData } from "../../hooks/useDatastoreData";
import { DatastoreTableCard } from "../DatastoreTableCard";

type Bundle = ReturnType<typeof useDatastoreData>;

function ErrorsAndConnectionsRowComponent({ bundle }: { bundle: Bundle }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <DatastoreTableCard
        eyebrow="Errors"
        title="Error pressure by type"
        rows={bundle.errorsQuery.data ?? []}
        columns={ERROR_COLUMNS}
        rowKey={(row) => row.error_type}
        pageSize={8}
        scrollX={480}
      />
      <DatastoreTableCard
        eyebrow="Connections"
        title="Pool utilization"
        rows={bundle.connectionsQuery.data ?? []}
        columns={CONNECTION_COLUMNS}
        rowKey={(row) => row.pool_name}
        pageSize={8}
        scrollX={760}
      />
    </div>
  );
}

export const ErrorsAndConnectionsRow = memo(ErrorsAndConnectionsRowComponent);
