/**
 * Traces Service — API calls for distributed tracing.
 */
import { API_CONFIG } from '@config/apiConfig';
import { z } from 'zod';

import api from './api';
import { validateResponse } from './utils/validate';
import { traceRecordSchema, spanRecordSchema } from './schemas/tracesSchemas';

import type { TraceRecord, SpanRecord } from './schemas/tracesSchemas';
import type { QueryParams, RequestTime } from './service-types';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const tracesListSchema = z.object({
  traces: z.array(traceRecordSchema),
  total: z.number(),
});

const spanListSchema = z.array(spanRecordSchema);

/**
 * Service wrapper for distributed tracing endpoints.
 */
export const tracesService = {
  async getTraces(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    params: QueryParams = {},
  ): Promise<{ traces: TraceRecord[]; total: number }> {
    const data = await api.get(`${BASE}/traces`, { params: { startTime, endTime, ...params } });
    return validateResponse(tracesListSchema, data);
  },

  async getTraceSpans(_teamId: number | null, traceId: string): Promise<SpanRecord[]> {
    const data = await api.get(`${BASE}/traces/${traceId}/spans`);
    return validateResponse(spanListSchema, data);
  },

  async getSpanTree(_teamId: number | null, spanId: string): Promise<unknown> {
    return api.get(`${BASE}/spans/${spanId}/tree`);
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
    endMs?: number,
  ): Promise<unknown> {
    return api.get(`${BASE}/traces/${traceId}/related`, {
      params: { service: serviceName, operation: operationName, startTime: startMs, endTime: endMs },
    });
  },

  async postAnalytics(query: unknown): Promise<unknown> {
    return api.post(`${BASE}/spans/analytics`, query);
  },

  async getDimensions(): Promise<unknown> {
    return api.get(`${BASE}/spans/analytics/dimensions`);
  },

  async getSpanSearch(startTime: RequestTime, endTime: RequestTime, params: QueryParams = {}): Promise<unknown> {
    return api.get(`${BASE}/spans/search`, { params: { startTime, endTime, ...params } });
  },

  async getFlamegraphData(traceId: string): Promise<unknown> {
    return api.get(`${BASE}/traces/${traceId}/flamegraph`);
  },

  async getTraceComparison(traceA: string, traceB: string): Promise<unknown> {
    return api.get(`${BASE}/traces/compare`, { params: { traceA, traceB } });
  },

  async getLatencyHeatmap(startTime: RequestTime, endTime: RequestTime, service: string): Promise<unknown> {
    return api.get(`${BASE}/latency/heatmap`, { params: { startTime, endTime, service } });
  },

  async getREDSummary(startTime: RequestTime, endTime: RequestTime): Promise<unknown> {
    return api.get(`${BASE}/metrics/red/summary`, { params: { startTime, endTime } });
  },

  async getApdex(startTime: RequestTime, endTime: RequestTime, service: string): Promise<unknown> {
    return api.get(`${BASE}/metrics/red/apdex`, { params: { startTime, endTime, service } });
  },

  getLiveTailUrl(filters: QueryParams = {}): string {
    const query = new URLSearchParams(filters as Record<string, string>).toString();
    return `${BASE}/spans/live-tail${query ? '?' + query : ''}`;
  },
};
