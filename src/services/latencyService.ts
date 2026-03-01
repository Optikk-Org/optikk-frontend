/**
 * Latency Service — API calls for latency analysis.
 */
import api from './api';
import { API_CONFIG } from '@config/constants';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

export const latencyService = {
    async getHistogram(teamId, startTime, endTime, params = {}) {
        return api.get(`${BASE}/latency/histogram`, { params: { startTime, endTime, ...params } });
    },

    async getHeatmap(teamId, startTime, endTime, serviceName, interval = '5m') {
        return api.get(`${BASE}/latency/heatmap`, { params: { startTime, endTime, serviceName, interval } });
    },
};
