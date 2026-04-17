import { memo } from "react";

import { OPERATION_COLUMNS } from "../../columns";
import type { useDatastoreData } from "../../hooks/useDatastoreData";
import { DatastoreTableCard } from "../DatastoreTableCard";

type Bundle = ReturnType<typeof useDatastoreData>;

function OperationsTableComponent({ bundle }: { bundle: Bundle }) {
  return (
    <DatastoreTableCard
      eyebrow="Operations"
      title="Latency and throughput by operation"
      rows={bundle.operationsQuery.data ?? []}
      columns={OPERATION_COLUMNS}
      rowKey={(row) => row.operation}
      pageSize={10}
      scrollX={820}
    />
  );
}

export const OperationsTable = memo(OperationsTableComponent);
