import { memo } from "react";

import type { useDatastoreData } from "../hooks/useDatastoreData";

import { ErrorsAndConnectionsRow } from "./tables/ErrorsAndConnectionsRow";
import { OperationsTable } from "./tables/OperationsTable";
import { ServersAndNamespacesRow } from "./tables/ServersAndNamespacesRow";
import { SlowQueriesTable } from "./tables/SlowQueriesTable";

type Bundle = ReturnType<typeof useDatastoreData>;

function DatastoreTablesComponent({ bundle }: { bundle: Bundle }) {
  return (
    <>
      <ServersAndNamespacesRow bundle={bundle} />
      <OperationsTable bundle={bundle} />
      <ErrorsAndConnectionsRow bundle={bundle} />
      <SlowQueriesTable bundle={bundle} />
    </>
  );
}

export const DatastoreTables = memo(DatastoreTablesComponent);
