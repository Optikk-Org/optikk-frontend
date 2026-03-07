import { z } from 'zod';
import { logsService } from '@shared/api/logsService';
import { logEntrySchema, type LogEntry } from '@entities/log/model';
import type { TeamId } from '@shared/types/branded';
import type { QueryParams, RequestTime } from '@shared/api/service-types';

/**
 * Normalized backend parameters for logs.
 */
export interface LogsBackendParams extends QueryParams {
  limit?: number;
  offset?: number;
  search?: string;
  levels?: string[];
  excludeLevels?: string[];
  services?: string[];
  excludeServices?: string[];
  hosts?: string[];
  excludeHosts?: string[];
  pods?: string[];
  containers?: string[];
  loggers?: string[];
  traceId?: string;
  spanId?: string;
}

export const logsStatsSchema = z.object({
  total: z.number(),
  fields: z.object({
    level: z.array(z.object({
      value: z.string(),
      count: z.number(),
    })),
    service_name: z.array(z.object({
      value: z.string(),
      count: z.number(),
    })),
  }),
}).passthrough();

export type LogsStats = z.infer<typeof logsStatsSchema>;

export const logsVolumeSchema = z.object({
  step: z.string(),
  buckets: z.array(z.object({
    time_bucket: z.string(),
    total: z.number(),
    errors: z.number(),
    warnings: z.number(),
    infos: z.number(),
    debugs: z.number(),
    fatals: z.number(),
  })),
}).passthrough();

export type LogsVolume = z.infer<typeof logsVolumeSchema>;

/**
 * Log Feature API wrapper.
 * Integrates Zod validation and branded types for strict API boundaries.
 */
export const logsApi = {
  getLogs: async (params: {
    teamId: TeamId | null;
    startTime: RequestTime;
    endTime: RequestTime;
    backendParams?: LogsBackendParams;
  }): Promise<{ logs: LogEntry[]; total: number }> => {
    const response = await logsService.getLogs(
      params.teamId,
      params.startTime,
      params.endTime,
      params.backendParams
    ) as any;
    
    return {
      logs: z.array(logEntrySchema).parse(response.logs || []),
      total: Number(response.total || 0),
    };
  },

  getLogStats: async (params: {
    teamId: TeamId | null;
    startTime: RequestTime;
    endTime: RequestTime;
    backendParams?: LogsBackendParams;
  }): Promise<LogsStats> => {
    const response = await logsService.getLogStats(
      params.teamId,
      params.startTime,
      params.endTime,
      params.backendParams
    );
    return logsStatsSchema.parse(response);
  },

  getLogVolume: async (params: {
    teamId: TeamId | null;
    startTime: RequestTime;
    endTime: RequestTime;
    step?: string;
    backendParams?: LogsBackendParams;
  }): Promise<LogsVolume> => {
    const response = await logsService.getLogVolume(
      params.teamId,
      params.startTime,
      params.endTime,
      params.step,
      params.backendParams
    );
    return logsVolumeSchema.parse(response);
  },
};
