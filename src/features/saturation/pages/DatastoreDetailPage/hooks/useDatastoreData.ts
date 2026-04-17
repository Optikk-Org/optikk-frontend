import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { saturationApi } from "../../../api/saturationApi";

/**
 * Bundles the seven queries that drive the datastore detail page.
 * Each is keyed on the team, time range, and `system`.
 */
export function useDatastoreData(system: string) {
  const overviewQuery = useTimeRangeQuery(
    "saturation-datastore-overview",
    (teamId, startTime, endTime) =>
      saturationApi.getDatastoreOverview(system, teamId, startTime, endTime),
    { extraKeys: [system] }
  );
  const serversQuery = useTimeRangeQuery(
    "saturation-datastore-servers",
    (teamId, startTime, endTime) =>
      saturationApi.getDatastoreServers(system, teamId, startTime, endTime),
    { extraKeys: [system] }
  );
  const namespacesQuery = useTimeRangeQuery(
    "saturation-datastore-namespaces",
    (teamId, startTime, endTime) =>
      saturationApi.getDatastoreNamespaces(system, teamId, startTime, endTime),
    { extraKeys: [system] }
  );
  const operationsQuery = useTimeRangeQuery(
    "saturation-datastore-operations",
    (teamId, startTime, endTime) =>
      saturationApi.getDatastoreOperations(system, teamId, startTime, endTime),
    { extraKeys: [system] }
  );
  const errorsQuery = useTimeRangeQuery(
    "saturation-datastore-errors",
    (teamId, startTime, endTime) =>
      saturationApi.getDatastoreErrors(system, teamId, startTime, endTime),
    { extraKeys: [system] }
  );
  const connectionsQuery = useTimeRangeQuery(
    "saturation-datastore-connections",
    (teamId, startTime, endTime) =>
      saturationApi.getDatastoreConnections(system, teamId, startTime, endTime),
    { extraKeys: [system] }
  );
  const slowQueriesQuery = useTimeRangeQuery(
    "saturation-datastore-slow-queries",
    (teamId, startTime, endTime) =>
      saturationApi.getDatastoreSlowQueries(system, teamId, startTime, endTime),
    { extraKeys: [system] }
  );

  return {
    overviewQuery,
    serversQuery,
    namespacesQuery,
    operationsQuery,
    errorsQuery,
    connectionsQuery,
    slowQueriesQuery,
  };
}
