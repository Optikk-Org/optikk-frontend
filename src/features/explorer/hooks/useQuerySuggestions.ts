import { useMemo } from "react";

import { useTimeRange } from "@app/store/appStore";
import { resolveTimeBounds } from "@/features/explorer/utils/timeRange";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import { fetchSuggestions, type SuggestionItem } from "../search/suggestApi";

interface Args {
  readonly field: string | null;
  readonly prefix: string;
  readonly enabled?: boolean;
}

const FIVE_MIN_MS = 5 * 60 * 1000;

/**
 * Fetches top-K values for a field given the current prefix. Cache is keyed on
 * a 5-min time bucket so a user's rapid typing doesn't thrash the BE.
 */
export function useQuerySuggestions({ field, prefix, enabled }: Args) {
  const timeRange = useTimeRange();
  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);
  const bucket = Math.floor(endTime / FIVE_MIN_MS);
  const effectiveEnabled = (enabled ?? true) && field !== null && field.trim() !== "";
  return useStandardQuery<SuggestionItem[]>({
    queryKey: ["traces", "suggest", field ?? "none", prefix, bucket],
    queryFn: () => fetchSuggestions({ startTime, endTime, field: field as string, prefix }),
    enabled: effectiveEnabled,
  });
}
