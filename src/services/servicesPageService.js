import api from './api';
import { API_CONFIG } from '@config/constants';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

export const servicesPageService = {
  async getTotalServices(teamId, startTime, endTime) {
    return api.get(`${BASE}/services/summary/total`, { params: { startTime, endTime } });
  },

  async getHealthyServices(teamId, startTime, endTime) {
    return api.get(`${BASE}/services/summary/healthy`, { params: { startTime, endTime } });
  },

  async getDegradedServices(teamId, startTime, endTime) {
    return api.get(`${BASE}/services/summary/degraded`, { params: { startTime, endTime } });
  },

  async getUnhealthyServices(teamId, startTime, endTime) {
    return api.get(`${BASE}/services/summary/unhealthy`, { params: { startTime, endTime } });
  },

  async getServiceMetrics(teamId, startTime, endTime) {
    return api.get(`${BASE}/services/metrics`, { params: { startTime, endTime } });
  },

  async getServiceTimeSeries(teamId, startTime, endTime, interval = '5m') {
    return api.get(`${BASE}/services/timeseries`, { params: { startTime, endTime, interval } });
  },

  async getTopology(teamId, startTime, endTime) {
    return api.get(`${BASE}/services/topology`, { params: { startTime, endTime } });
  },
};
