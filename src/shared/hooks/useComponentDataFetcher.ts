import { type UseQueryResult, keepPreviousData, useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

import type {
  DashboardDataSourceValue,
  DashboardDataSources,
  DashboardPanelSpec,
} from "@/types/dashboardConfig";

import { api } from "@shared/api/api/client";
import type { ApiErrorShape } from "@shared/api/api/interceptors/errorInterceptor";
import { toApiErrorShape } from "@shared/api/utils/errorNormalization";
import { interpolateValue } from "@shared/utils/placeholderInterpolation";

import { resolveTimeRangeBounds, timeRangeQuerySegment } from "@/types";

import { useTeamId, useTimeRange } from "@app/store/appStore";

interface ComponentFailedRequest {
  componentIds: string[];
  endpoint: string;
  method: string;
  error: ApiErrorShape;
}

interface UseComponentDataFetcherResult {
  data: DashboardDataSources;
  isLoading: boolean;
  errors: Record<string, ApiErrorShape | null>;
  hasError: boolean;
  failedRequests: ComponentFailedRequest[];
}

function buildRequestKey(
  component: DashboardPanelSpec,
  resolvedEndpoint: string,
  resolvedParams: Record<string, unknown>,
  rangeSegment: string
) {
  return JSON.stringify({
    method: component.query?.method || "GET",
    endpoint: resolvedEndpoint,
    params: resolvedParams,
    rangeSegment,
  });
}

/**
 *
 */
export function useComponentDataFetcher(
  components: DashboardPanelSpec[],
  pathParams?: Record<string, string>
): UseComponentDataFetcherResult {
  const selectedTeamId = useTeamId();
  const timeRange = useTimeRange();
  const rangeSegment = useMemo(() => timeRangeQuerySegment(timeRange), [timeRange]);

  const requestEntries = useMemo(() => {
    const entries = new Map<
      string,
      {
        componentIds: string[];
        endpoint: string;
        method: string;
        params: Record<string, unknown>;
      }
    >();

    components.forEach((component) => {
      if (!component.query) return;
      const interpolationValues = pathParams ?? {};
      const resolvedEndpoint = interpolateValue(component.query.endpoint, interpolationValues);
      const resolvedParams = interpolateValue(
        component.query.params || {},
        interpolationValues
      ) as Record<string, unknown>;
      const method = String(component.query.method || "GET").toUpperCase();
      const requestKey = buildRequestKey(
        component,
        resolvedEndpoint,
        resolvedParams,
        rangeSegment
      );

      const current = entries.get(requestKey);
      if (current) {
        current.componentIds.push(component.id);
        return;
      }

      entries.set(requestKey, {
        componentIds: [component.id],
        endpoint: resolvedEndpoint,
        method,
        params: resolvedParams,
      });
    });

    return Array.from(entries.values());
  }, [components, pathParams, rangeSegment]);

  const results = useQueries({
    queries: requestEntries.map((entry) => ({
      queryKey: [
        "component-query",
        selectedTeamId,
        entry.method,
        entry.endpoint,
        entry.params,
        rangeSegment,
      ],
      queryFn: () => {
        const { startTime, endTime } = resolveTimeRangeBounds(timeRange);
        return api.request({
          url: entry.endpoint,
          method: entry.method,
          params: {
            start: startTime,
            end: endTime,
            ...entry.params,
          },
        });
      },
      enabled: !!selectedTeamId,
      staleTime: 0,
      gcTime: 30_000,
      placeholderData: keepPreviousData,
      retry: false,
    })),
  });

  const data: DashboardDataSources = {};
  const errors: Record<string, ApiErrorShape | null> = {};
  let isLoading = false;
  let hasError = false;
  const failedRequests: ComponentFailedRequest[] = [];

  requestEntries.forEach((entry, index) => {
    const result = results[index] as UseQueryResult<unknown> | undefined;

    // Pending with no cached row yet — not mere background refetch (avoids chart blink).
    if (result?.isPending && result.data === undefined) {
      isLoading = true;
    }

    const normalizedError = result?.isError ? toApiErrorShape(result.error) : null;
    if (normalizedError) {
      hasError = true;
      failedRequests.push({
        componentIds: entry.componentIds,
        endpoint: entry.endpoint,
        method: entry.method,
        error: normalizedError,
      });
    }

    entry.componentIds.forEach((componentId) => {
      data[componentId] = result?.data as DashboardDataSourceValue;
      errors[componentId] = normalizedError;
    });
  });

  return { data, isLoading, errors, hasError, failedRequests };
}
