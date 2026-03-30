/**
 * Traces Service — API calls for distributed tracing.
 */
import { API_CONFIG } from '@config/apiConfig';
import { z } from 'zod';

import api from './api';
import { validateResponse } from './utils/validate';
import {
  traceRecordSchema,
  spanRecordSchema,
  tracesSummarySchema,
  flamegraphFrameSchema,
} from './schemas/tracesSchemas';

import type {
  TraceRecord,
  SpanRecord,
  TracesSummary,
  FlamegraphFrame,
} from './schemas/tracesSchemas';
import type { QueryParams, RequestTime } from './service-types';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const tracesListSchema = z
  .object({
    traces: z.array(traceRecordSchema),
    total: z.number(),
    summary: tracesSummarySchema.optional(),
  })
  .strict();

const spanListSchema = z.array(spanRecordSchema);

/**
 * Service wrapper for distributed tracing endpoints.
 */
export const tracesService = {
  async getTraces(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    params: QueryParams = {}
  ): Promise<{ traces: TraceRecord[]; total: number; summary?: TracesSummary }> {
    const data = await api.get(`${BASE}/traces`, { params: { startTime, endTime, ...params } });
    return validateResponse(tracesListSchema, data);
  },

  async getTraceSpans(_teamId: number | null, traceId: string): Promise<SpanRecord[]> {
    const data = await api.get(`${BASE}/traces/${traceId}/spans`);
    return validateResponse(spanListSchema, data);
  },

  async getTraceLogs(_teamId: number | null, traceId: string): Promise<unknown> {
    return api.get(`${BASE}/traces/${traceId}/logs`);
  },

  async getSpanEvents(traceId: string): Promise<unknown> {
    return api.get(`${BASE}/traces/${traceId}/span-events`);
  },

  async getSpanKindBreakdown(traceId: string): Promise<unknown> {
    return api.get(`${BASE}/traces/${traceId}/span-kind-breakdown`);
  },

  async getCriticalPath(traceId: string): Promise<unknown> {
    return api.get(`${BASE}/traces/${traceId}/critical-path`);
  },

  async getSpanSelfTimes(traceId: string): Promise<unknown> {
    return api.get(`${BASE}/traces/${traceId}/span-self-times`);
  },

  async getErrorPath(traceId: string): Promise<unknown> {
    return api.get(`${BASE}/traces/${traceId}/error-path`);
  },

  async getSpanAttributes(traceId: string, spanId: string): Promise<unknown> {
    return api.get(`${BASE}/traces/${traceId}/spans/${spanId}/attributes`);
  },

  async getRelatedTraces(
    traceId: string,
    serviceName?: string,
    operationName?: string,
    startMs?: number,
    endMs?: number
  ): Promise<unknown> {
    return api.get(`${BASE}/traces/${traceId}/related`, {
      params: {
        service: serviceName,
        operation: operationName,
        startTime: startMs,
        endTime: endMs,
      },
    });
  },

  async getFlamegraphData(traceId: string): Promise<FlamegraphFrame[]> {
    const data = await api.get(`${BASE}/traces/${traceId}/flamegraph`);
    return validateResponse(z.array(flamegraphFrameSchema), data);
  },

  async getTraceComparison(traceA: string, traceB: string): Promise<unknown> {
    return api.get(`${BASE}/traces/compare`, { params: { traceA, traceB } });
  },
};
