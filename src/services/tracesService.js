/**
 * Traces Service — API calls for distributed tracing.
 */
import api from './api';
import { API_CONFIG } from '@config/constants';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

export const tracesService = {
    async getTraces(teamId, startTime, endTime, params = {}) {
        return api.get(`${BASE}/traces`, { params: { startTime, endTime, ...params } });
    },

    async getTraceSpans(teamId, traceId) {
        return api.get(`${BASE}/traces/${traceId}/spans`);
    },

    async getSpanTree(teamId, spanId) {
        return api.get(`${BASE}/spans/${spanId}/tree`);
    },

    async getTraceLogs(teamId, traceId) {
        return api.get(`${BASE}/traces/${traceId}/logs`);
    },
};
