/**
 * AI Observability Service — API calls for AI/ML model monitoring.
 */
import api from './api';
import { API_CONFIG } from '@config/constants';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

export const aiService = {
    async getSummary(teamId, startTime, endTime) {
        return api.get(`${BASE}/ai/summary`, { params: { startTime, endTime } });
    },

    async getActiveModels(teamId, startTime, endTime) {
        return api.get(`${BASE}/ai/models`, { params: { startTime, endTime } });
    },

    async getPerformanceMetrics(teamId, startTime, endTime) {
        return api.get(`${BASE}/ai/performance/metrics`, { params: { startTime, endTime } });
    },

    async getPerformanceTimeSeries(teamId, startTime, endTime, interval = '5m') {
        return api.get(`${BASE}/ai/performance/timeseries`, { params: { startTime, endTime, interval } });
    },

    async getLatencyHistogram(teamId, startTime, endTime, modelName) {
        return api.get(`${BASE}/ai/performance/latency-histogram`, { params: { startTime, endTime, modelName } });
    },

    async getCostMetrics(teamId, startTime, endTime) {
        return api.get(`${BASE}/ai/cost/metrics`, { params: { startTime, endTime } });
    },

    async getCostTimeSeries(teamId, startTime, endTime, interval = '5m') {
        return api.get(`${BASE}/ai/cost/timeseries`, { params: { startTime, endTime, interval } });
    },

    async getTokenBreakdown(teamId, startTime, endTime) {
        return api.get(`${BASE}/ai/cost/token-breakdown`, { params: { startTime, endTime } });
    },

    async getSecurityMetrics(teamId, startTime, endTime) {
        return api.get(`${BASE}/ai/security/metrics`, { params: { startTime, endTime } });
    },

    async getSecurityTimeSeries(teamId, startTime, endTime, interval = '5m') {
        return api.get(`${BASE}/ai/security/timeseries`, { params: { startTime, endTime, interval } });
    },

    async getPiiCategories(teamId, startTime, endTime) {
        return api.get(`${BASE}/ai/security/pii-categories`, { params: { startTime, endTime } });
    },
};
