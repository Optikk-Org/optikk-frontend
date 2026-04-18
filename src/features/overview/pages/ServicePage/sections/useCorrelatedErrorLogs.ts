import { logsService } from "@shared/api/logsService";
import type { LogRecord } from "@shared/api/schemas/logsSchemas";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

export function useCorrelatedErrorLogs(serviceName: string, limit = 20): {
  logs: readonly LogRecord[];
  loading: boolean;
} {
  const enabled = Boolean(serviceName);
  const query = useTimeRangeQuery(
    "service-page-correlated-error-logs",
    (teamId, startTime, endTime) =>
      logsService.getLogs(teamId, startTime, endTime, {
        services: [serviceName],
        severities: ["ERROR", "FATAL"],
        limit,
        offset: 0,
      }),
    { extraKeys: [serviceName, limit], enabled }
  );

  return {
    logs: query.data?.logs ?? [],
    loading: query.isLoading && (query.data?.logs ?? []).length === 0,
  };
}
