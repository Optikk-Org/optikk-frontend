import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useRefreshKey, useTeamId, useTimeRange } from "@app/store/appStore";

import { resolveTimeBounds } from "@/features/explorer-core/utils/timeRange";

import type { StructuredFilter } from "@shared/hooks/useURLFilters";
import { logsExplorerApi } from "../api/logsExplorerApi";
import type { LogAggregateRow, LogFacet, LogVolumeBucket } from "../types";

export interface UseLogsHubDataProps {
  /** Compiled filter string for `POST /v1/logs/query`. */
  filterQuery: string;
  filters: StructuredFilter[];
  /** Cursor for the current page; empty string = first page. */
  cursor: string;
  pageSize: number;
}

const DEFAULT_STEP = "5m";

export function useLogsHubData({
  filterQuery,
  filters: _filters,
  cursor,
  pageSize,
}: UseLogsHubDataProps) {
  const selectedTeamId = useTeamId();
  const timeRange = useTimeRange();
  const refreshKey = useRefreshKey();

  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);

  const listRequest = useMemo(
    () => ({
      startTime,
      endTime,
      limit: pageSize,
      step: DEFAULT_STEP,
      query: filterQuery,
      cursor,
    }),
    [startTime, endTime, pageSize, filterQuery, cursor]
  );

  const listQuery = useQuery({
    queryKey: ["logs", "hub", selectedTeamId, listRequest, refreshKey],
    queryFn: () => logsExplorerApi.query(listRequest),
    // Use nullish check so team id 0 is not treated as "disabled" (Boolean(0) is false).
    enabled: selectedTeamId != null,
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    retry: 2,
  });

  const results = listQuery.data;
  const logs = results?.results ?? [];
  const serviceFacets = (results?.facets.service_name ?? []) as LogFacet[];
  const levelFacets = (results?.facets.level ?? []) as LogFacet[];
  const hostFacets = (results?.facets.host ?? []) as LogFacet[];
  const podFacets = (results?.facets.pod ?? []) as LogFacet[];
  const containerFacets = (results?.facets.container ?? []) as LogFacet[];
  const environmentFacets = (results?.facets.environment ?? []) as LogFacet[];
  const scopeNameFacets = (results?.facets.scope_name ?? []) as LogFacet[];
  const aggregateRows = ((
    results?.correlations?.serviceErrorRate as { rows?: LogAggregateRow[] } | undefined
  )?.rows ?? []) as LogAggregateRow[];

  return {
    logs,
    logsLoading: listQuery.isPending,
    logsError: listQuery.isError,
    logsErrorDetail: listQuery.error,
    hasMore: Boolean(results?.pageInfo.hasMore),
    nextCursor: results?.pageInfo.nextCursor ?? "",
    volumeBuckets: (results?.trend.buckets ?? []) as LogVolumeBucket[],
    volumeStep: results?.trend.step ?? DEFAULT_STEP,
    volumeLoading: listQuery.isPending,
    errorCount: Number(results?.summary.error_logs ?? 0),
    warnCount: Number(results?.summary.warn_logs ?? 0),
    totalCount: Number(results?.summary.total_logs ?? 0),
    serviceFacets,
    levelFacets,
    hostFacets,
    podFacets,
    containerFacets,
    environmentFacets,
    scopeNameFacets,
    statsLoading: listQuery.isPending,
    aggregateRows,
    aggregateLoading: listQuery.isPending,
  };
}
