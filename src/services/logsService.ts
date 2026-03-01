/**
 * Logs Service — API calls for log ingestion and retrieval.
 */
import api from './api';
import { API_CONFIG } from '@config/constants';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

export const logsService = {
    async getLogs(teamId: any, startTime: any, endTime: any, params = {}): Promise<any> {
        return api.get(`${BASE}/logs`, { params: { startTime, endTime, ...params } });
    },

    async getLogHistogram(teamId: any, startTime: any, endTime: any, interval = '1m'): Promise<any> {
        return api.get(`${BASE}/logs/histogram`, { params: { startTime, endTime, step: interval } });
    },

    async getLogDetail(teamId: any, traceId: any, spanId: any, timestamp: any, contextWindow = 30): Promise<any> {
        return api.get(`${BASE}/logs/detail`, { params: { traceId, spanId, timestamp, contextWindow } });
    },

    async getLogStats(teamId: any, startTime: any, endTime: any, params = {}): Promise<any> {
        return api.get(`${BASE}/logs/stats`, { params: { startTime, endTime, ...params } });
    },

    async getLogVolume(teamId: any, startTime: any, endTime: any, step?: string, params = {}): Promise<any> {
        return api.get(`${BASE}/logs/volume`, { params: { startTime, endTime, step, ...params } });
    },

    async getLogFields(teamId: any, startTime: any, endTime: any, field: string, params = {}): Promise<any> {
        return api.get(`${BASE}/logs/fields`, { params: { startTime, endTime, field, ...params } });
    },

    async getLogSurrounding(teamId: any, logId: any, before = 10, after = 10): Promise<any> {
        return api.get(`${BASE}/logs/surrounding`, { params: { id: logId, before, after } });
    },
};
