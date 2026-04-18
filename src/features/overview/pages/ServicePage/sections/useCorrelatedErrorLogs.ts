import { logsService } from "@shared/api/logsService";
import type { LogRecord } from "@shared/api/schemas/logsSchemas";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

interface LogsResponse {
  readonly logs: LogRecord[];
  readonly total: number;
  readonly cursor?: string;
}

export function useCorrelatedErrorLogs(serviceName: string, limit = 20): {
  logs: readonly LogRecord[];
  loading: boolean;
} {
  const enabled = Boolean(serviceName);
  const query = useTimeRangeQuery<LogsResponse>(
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

  const logs = query.data?.logs ?? [];
  return {
    logs,
    loading: query.isLoading && logs.length === 0,
  };
}
