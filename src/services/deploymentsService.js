/**
 * Deployments Service — API calls for deployment tracking.
 */
import api from './api';
import { API_CONFIG } from '@config/constants';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

export const deploymentsService = {
    async getDeployments(teamId, startTime, endTime, params = {}) {
        return api.get(`${BASE}/deployments`, { params: { startTime, endTime, ...params } });
    },

    async getDeployEvents(teamId, startTime, endTime, serviceName) {
        return api.get(`${BASE}/deployments/events`, { params: { startTime, endTime, serviceName } });
    },

    async getDeployDiff(teamId, deployId, windowMinutes = 30) {
        return api.get(`${BASE}/deployments/${deployId}/diff`, { params: { windowMinutes } });
    },

    async createDeployment(teamId, data) {
        return api.post(`${BASE}/deployments`, data);
    },
};
