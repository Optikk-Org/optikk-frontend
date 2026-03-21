import { z } from 'zod';

import { logEntrySchema, type LogEntry } from '@/entities/log/model';
import { logsService } from '@/shared/api/logsService';

import type { LogsBackendParams } from './logsApi';

const facetSchema = z.object({
  value: z.string(),
  count: z.number(),
});

const logsExplorerSchema = z.object({
  results: z.array(logEntrySchema).default([]),
  summary: z.object({
    total_logs: z.number().default(0),
    error_logs: z.number().default(0),
    warn_logs: z.number().default(0),
    service_count: z.number().default(0),
  }),
  facets: z.record(z.string(), z.array(facetSchema)).default({}),
  trend: z.object({
    step: z.string().default('5m'),
    buckets: z.array(
      z.object({
        time_bucket: z.string(),
        total: z.number().default(0),
        errors: z.number().default(0),
        warnings: z.number().default(0),
        infos: z.number().default(0),
        debugs: z.number().default(0),
        fatals: z.number().default(0),
      }),
    ).default([]),
  }),
  pageInfo: z.object({
    total: z.number().default(0),
    hasMore: z.boolean().default(false),
    nextCursor: z.string().optional(),
    offset: z.number().default(0),
    limit: z.number().default(50),
  }),
  correlations: z.record(z.string(), z.unknown()).optional(),
});

export type LogsExplorerResponse = z.infer<typeof logsExplorerSchema>;

function normalizeLog(raw: z.infer<typeof logEntrySchema>): LogEntry {
  return {
    ...raw,
    level: raw.severity_text ?? raw.level ?? '',
    message: raw.body ?? raw.message ?? '',
    service: raw.service_name ?? raw.service ?? '',
    service_name: raw.service_name ?? raw.service ?? '',
    trace_id: raw.trace_id ?? '',
    span_id: raw.span_id ?? '',
  };
}

export const logsExplorerApi = {
  async query(body: {
    startTime: number;
    endTime: number;
    limit: number;
    offset: number;
    step: string;
    params: LogsBackendParams;
  }): Promise<LogsExplorerResponse> {
    const response = await logsService.queryExplorer(body);
    const parsed = logsExplorerSchema.parse(response);
    return {
      ...parsed,
      results: parsed.results.map(normalizeLog),
    };
  },
};
