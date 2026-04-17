import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { saturationApi } from "../../../api/saturationApi";

type SystemApiMethod =
  | "getDatastoreOverview"
  | "getDatastoreServers"
  | "getDatastoreNamespaces"
  | "getDatastoreOperations"
  | "getDatastoreErrors"
  | "getDatastoreConnections"
  | "getDatastoreSlowQueries";

function useSystemQuery<K extends SystemApiMethod>(
  key: string,
  method: K,
  system: string
) {
  return useTimeRangeQuery(
    key,
    (teamId, startTime, endTime) => saturationApi[method](system, teamId, startTime, endTime),
    { extraKeys: [system] }
  );
}

export function useDatastoreData(system: string) {
  return {
    overviewQuery: useSystemQuery("saturation-datastore-overview", "getDatastoreOverview", system),
    serversQuery: useSystemQuery("saturation-datastore-servers", "getDatastoreServers", system),
    namespacesQuery: useSystemQuery("saturation-datastore-namespaces", "getDatastoreNamespaces", system),
    operationsQuery: useSystemQuery("saturation-datastore-operations", "getDatastoreOperations", system),
    errorsQuery: useSystemQuery("saturation-datastore-errors", "getDatastoreErrors", system),
    connectionsQuery: useSystemQuery("saturation-datastore-connections", "getDatastoreConnections", system),
    slowQueriesQuery: useSystemQuery("saturation-datastore-slow-queries", "getDatastoreSlowQueries", system),
  };
}
