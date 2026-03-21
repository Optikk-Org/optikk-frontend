import { z } from 'zod';

import { traceRecordSchema } from '@/entities/trace/model';
import { tracesService } from '@/shared/api/tracesService';

import { normalizeTrace } from '../utils/tracesUtils';
import type { TracesBackendParams } from './tracesApi';

const facetSchema = z.object({
  value: z.string(),
  count: z.number(),
});

const trendBucketSchema = z.object({
  time_bucket: z.string(),
  total_traces: z.number(),
  error_traces: z.number(),
  p95_duration: z.number(),
});

const tracesExplorerSchema = z.object({
  results: z.array(traceRecordSchema).default([]),
  summary: z.object({
    total_traces: z.number().default(0),
    error_traces: z.number().default(0),
    avg_duration: z.number().default(0),
    p50_duration: z.number().default(0),
    p95_duration: z.number().default(0),
    p99_duration: z.number().default(0),
  }),
  facets: z.record(z.string(), z.array(facetSchema)).default({}),
  trend: z.array(trendBucketSchema).default([]),
  pageInfo: z.object({
    total: z.number().default(0),
    hasMore: z.boolean().default(false),
    nextCursor: z.string().optional(),
    offset: z.number().default(0),
    limit: z.number().default(50),
  }),
  correlations: z.record(z.string(), z.unknown()).optional(),
});

export type TracesExplorerResponse = z.infer<typeof tracesExplorerSchema>;

export const tracesExplorerApi = {
  async query(body: {
    startTime: number;
    endTime: number;
    limit: number;
    offset: number;
    step: string;
    params: TracesBackendParams & { search?: string; mode?: string };
  }): Promise<TracesExplorerResponse> {
    const response = await tracesService.queryExplorer(body);
    const parsed = tracesExplorerSchema.parse(response);
    return {
      ...parsed,
      results: parsed.results.map((trace) => normalizeTrace(trace)),
    };
  },
};
