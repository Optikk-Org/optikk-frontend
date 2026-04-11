import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { resolveTimeBounds } from "@/features/explorer-core/utils/timeRange";
import { useRefreshKey, useTeamId, useTimeRange } from "@app/store/appStore";
import { useURLFilters } from "@shared/hooks/useURLFilters";

import { aiExplorerApi } from "../api/aiExplorerApi";
import { EMPTY_AI_FACETS, EMPTY_AI_SUMMARY } from "../constants";
import type { AIExplorerFacets, AISummary } from "../types";
import { buildAIExplorerQuery } from "../utils/aiExplorerQuery";

const AI_URL_FILTER_CONFIG = {
  params: [
    { key: "provider", type: "string" as const, defaultValue: "" },
    { key: "model", type: "string" as const, defaultValue: "" },
    { key: "errorsOnly", type: "boolean" as const, defaultValue: false },
  ],
  syncStructuredFilters: true,
  stripParams: ["view", "search"],
};

export function useAIExplorer() {
  const selectedTeamId = useTeamId();
  const timeRange = useTimeRange();
  const refreshKey = useRefreshKey();

  const {
    values: urlValues,
    setters: urlSetters,
    structuredFilters: filters,
    setStructuredFilters: setFilters,
    clearAll: clearURLFilters,
  } = useURLFilters(AI_URL_FILTER_CONFIG);

  const selectedProvider =
    typeof urlValues.provider === "string" && urlValues.provider.length > 0
      ? urlValues.provider
      : null;
  const selectedModel =
    typeof urlValues.model === "string" && urlValues.model.length > 0
      ? urlValues.model
      : null;
  const errorsOnly = urlValues.errorsOnly === true;

  const setSelectedProvider = (value: string | null): void => {
    urlSetters.provider?.(value || "");
  };

  const setSelectedModel = (value: string | null): void => {
    urlSetters.model?.(value || "");
  };

  const setErrorsOnly = (value: boolean): void => {
    urlSetters.errorsOnly?.(value);
  };

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);

  const explorerQuery = useMemo(
    () =>
      buildAIExplorerQuery({
        filters,
        errorsOnly,
        selectedProvider,
        selectedModel,
      }),
    [filters, errorsOnly, selectedProvider, selectedModel]
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "ai",
      "explorer",
      selectedTeamId,
      startTime,
      endTime,
      page,
      pageSize,
      explorerQuery,
      refreshKey,
    ],
    queryFn: () =>
      aiExplorerApi.query({
        startTime,
        endTime,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        step: "5m",
        query: explorerQuery,
      }),
    enabled: Boolean(selectedTeamId),
    placeholderData: (previous) => previous,
    retry: false,
  });

  const aiCalls = useMemo(() => data?.results ?? [], [data?.results]);
  const total = Number(data?.pageInfo?.total ?? 0);
  const summary: AISummary = data?.summary ?? EMPTY_AI_SUMMARY;
  const facets: AIExplorerFacets = data?.facets ?? EMPTY_AI_FACETS;
  const trend = data?.trend ?? [];

  const errorRate = summary.total_calls > 0 ? (summary.error_calls * 100) / summary.total_calls : 0;

  const clearAll = useCallback((): void => {
    clearURLFilters();
    setPage(1);
  }, [clearURLFilters]);

  return {
    isLoading,
    isError,
    error,
    aiCalls,
    total,
    summary,
    facets,
    trend,
    errorRate,
    selectedProvider,
    selectedModel,
    errorsOnly,
    page,
    pageSize,
    filters,
    startTime,
    endTime,
    explorerQuery,
    setSelectedProvider,
    setSelectedModel,
    setErrorsOnly,
    setPage,
    setPageSize,
    setFilters,
    clearAll,
  };
}
