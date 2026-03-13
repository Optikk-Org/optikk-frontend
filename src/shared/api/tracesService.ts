/**
 * Traces Service — API calls for distributed tracing.
 */
import { API_CONFIG } from '@config/apiConfig';

import api from './api';

import type { QueryParams, RequestTime } from './service-types';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

/**
 * Service wrapper for distributed tracing endpoints.
 */
export const tracesService = {
  async getTraces(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    params: QueryParams = {},
  ): Promise<unknown> {
    return api.get(`${BASE}/traces`, { params: { startTime, endTime, ...params } });
  },

  async getTraceSpans(_teamId: number | null, traceId: string): Promise<unknown> {
    return api.get(`${BASE}/traces/${traceId}/spans`);
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

  async getRelatedTraces(traceId: string, startMs?: number, endMs?: number): Promise<unknown> {
    return api.get(`${BASE}/traces/${traceId}/related`, {
      params: { startMs, endMs },
    });
  },
};
