import { serviceDetailApi } from "@/features/overview/api/serviceDetailApi";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

export function useSloStats(serviceName: string) {
  const enabled = Boolean(serviceName);
  const query = useTimeRangeQuery(
    "service-page-slo-stats",
    (_teamId, start, end) => serviceDetailApi.getSloStats(start, end, serviceName),
    { extraKeys: [serviceName], enabled }
  );

  return {
    stats: query.data ?? null,
    loading: query.isLoading && !query.data,
  };
}
