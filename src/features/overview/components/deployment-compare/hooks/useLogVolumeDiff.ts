import { useStandardQuery } from "@shared/hooks/useStandardQuery";
import { logsService } from "@shared/api/logsService";
import type { LogVolume } from "@shared/api/schemas/logsSchemas";
import { useRefreshKey, useTeamId } from "@app/store/appStore";

export interface WindowVolume {
  readonly total: number;
  readonly errors: number;
  readonly fatals: number;
  readonly warnings: number;
}

export interface LogVolumeDiff {
  readonly before: WindowVolume | null;
  readonly after: WindowVolume;
  readonly loading: boolean;
}

function sumBuckets(volume: LogVolume | undefined | null): WindowVolume {
  const base: WindowVolume = { total: 0, errors: 0, fatals: 0, warnings: 0 };
  if (!volume) return base;
  return volume.buckets.reduce<WindowVolume>(
    (acc, bucket) => ({
      total: acc.total + bucket.total,
      errors: acc.errors + bucket.errors,
      fatals: acc.fatals + bucket.fatals,
      warnings: acc.warnings + bucket.warnings,
    }),
    base
  );
}

export function useLogVolumeDiff(
  serviceName: string,
  beforeStart: number | undefined,
  beforeEnd: number | undefined,
  afterStart: number,
  afterEnd: number
): LogVolumeDiff {
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();
  const enabled = Boolean(teamId && serviceName && afterEnd > afterStart);

  const afterQ = useStandardQuery<LogVolume>({
    queryKey: ["deploy-compare-log-volume-after", teamId, refreshKey, serviceName, afterStart, afterEnd],
    queryFn: () =>
      logsService.getLogVolume(teamId, afterStart, afterEnd, undefined, { services: [serviceName] }),
    enabled,
  });

  const beforeQ = useStandardQuery<LogVolume>({
    queryKey: ["deploy-compare-log-volume-before", teamId, refreshKey, serviceName, beforeStart, beforeEnd],
    queryFn: () =>
      logsService.getLogVolume(teamId, beforeStart ?? 0, beforeEnd ?? 0, undefined, {
        services: [serviceName],
      }),
    enabled: enabled && Boolean(beforeStart && beforeEnd),
  });

  return {
    before: beforeQ.data ? sumBuckets(beforeQ.data) : null,
    after: sumBuckets(afterQ.data),
    loading: afterQ.isLoading || beforeQ.isLoading,
  };
}
