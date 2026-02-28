/**
 * Logs Service — API calls for log ingestion and retrieval.
 */
import api from './api';
import { API_CONFIG } from '@config/constants';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

export const logsService = {
    async getLogs(teamId, startTime, endTime, params = {}) {
        return api.get(`${BASE}/logs`, { params: { startTime, endTime, ...params } });
    },

    async getLogHistogram(teamId, startTime, endTime, interval = '1m') {
        return api.get(`${BASE}/logs/histogram`, { params: { startTime, endTime, step: interval } });
    },

    async getLogDetail(teamId, traceId, spanId, timestamp, contextWindow = 30) {
        return api.get(`${BASE}/logs/detail`, { params: { traceId, spanId, timestamp, contextWindow } });
    },

    async getLogStats(teamId, startTime, endTime, params = {}) {
        return api.get(`${BASE}/logs/stats`, { params: { startTime, endTime, ...params } });
    },

    async getLogVolume(teamId, startTime, endTime, step, params = {}) {
        return api.get(`${BASE}/logs/volume`, { params: { startTime, endTime, step, ...params } });
    },

    async getLogFields(teamId, startTime, endTime, field, params = {}) {
        return api.get(`${BASE}/logs/fields`, { params: { startTime, endTime, field, ...params } });
    },

    async getLogSurrounding(teamId, logId, before = 10, after = 10) {
        return api.get(`${BASE}/logs/surrounding`, { params: { id: logId, before, after } });
    },
};
