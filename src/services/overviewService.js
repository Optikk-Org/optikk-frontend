import api from './api';
import { API_CONFIG } from '@config/constants';

const BASE = `${API_CONFIG.ENDPOINTS.V1.SERVICES_METRICS}/overview`;

export const overviewService = {
  async getSummary(teamId, startTime, endTime) {
    return api.get(`${BASE}/summary`, { params: { startTime, endTime } });
  },

  async getTimeSeries(teamId, startTime, endTime, serviceName, interval = '5m') {
    return api.get(`${BASE}/timeseries`, { params: { startTime, endTime, serviceName, interval } });
  },

  async getServices(teamId, startTime, endTime) {
    return api.get(`${BASE}/services`, { params: { startTime, endTime } });
  },

  async getEndpointMetrics(teamId, startTime, endTime, serviceName) {
    return api.get(`${BASE}/endpoints/metrics`, { params: { startTime, endTime, serviceName } });
  },

  async getEndpointTimeSeries(teamId, startTime, endTime, serviceName) {
    return api.get(`${BASE}/endpoints/timeseries`, { params: { startTime, endTime, serviceName } });
  },

  async getSloSli(teamId, startTime, endTime, serviceName, interval = '5m') {
    return api.get(`${BASE}/slo`, { params: { startTime, endTime, serviceName, interval } });
  },

  async getErrorGroups(teamId, startTime, endTime, params = {}) {
    return api.get(`${BASE}/errors/groups`, { params: { startTime, endTime, ...params } });
  },

  async getServiceErrorRate(teamId, startTime, endTime, serviceName, interval = '5m') {
    return api.get(`${BASE}/errors/service-error-rate`, { params: { startTime, endTime, serviceName, interval } });
  },

  async getErrorVolume(teamId, startTime, endTime, serviceName, interval = '5m') {
    return api.get(`${BASE}/errors/error-volume`, { params: { startTime, endTime, serviceName, interval } });
  },

  async getLatencyDuringErrorWindows(teamId, startTime, endTime, serviceName, interval = '5m') {
    return api.get(`${BASE}/errors/latency-during-error-windows`, { params: { startTime, endTime, serviceName, interval } });
  },
};
