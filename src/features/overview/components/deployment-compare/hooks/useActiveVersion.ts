import { deploymentsApi } from "@/features/overview/api/deploymentsApi";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

export function useActiveVersion(serviceName: string | undefined) {
  const enabled = Boolean(serviceName);
  const query = useTimeRangeQuery(
    "deployment-compare-active",
    async (_teamId, startTime, endTime) =>
      deploymentsApi.getActiveVersion(serviceName ?? "", startTime, endTime),
    { extraKeys: [serviceName ?? ""], enabled }
  );

  return {
    version: query.data?.version ?? "",
    environment: query.data?.environment ?? "",
    loading: query.isLoading,
  };
}
