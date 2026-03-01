import api from './api';
import { API_CONFIG } from '@config/constants';

const BASE = `${API_CONFIG.ENDPOINTS.V1_BASE}/overview`;

export const overviewService = {
  async getSummary(teamId: any, startTime: any, endTime: any): Promise<any> {
    return api.get(`${BASE}/summary`, { params: { startTime, endTime } });
  },

  async getTimeSeries(teamId: any, startTime: any, endTime: any, serviceName?: string, interval = '5m'): Promise<any> {
    return api.get(`${BASE}/timeseries`, { params: { startTime, endTime, serviceName, interval } });
  },

  async getServices(teamId: any, startTime: any, endTime: any): Promise<any> {
    return api.get(`${BASE}/services`, { params: { startTime, endTime } });
  },

  async getEndpointMetrics(teamId: any, startTime: any, endTime: any, serviceName?: string): Promise<any> {
    return api.get(`${BASE}/endpoints/metrics`, { params: { startTime, endTime, serviceName } });
  },

  async getEndpointTimeSeries(teamId: any, startTime: any, endTime: any, serviceName?: string): Promise<any> {
    return api.get(`${BASE}/endpoints/timeseries`, { params: { startTime, endTime, serviceName } });
  },

  async getSloSli(teamId: any, startTime: any, endTime: any, serviceName?: string, interval = '5m'): Promise<any> {
    return api.get(`${BASE}/slo`, { params: { startTime, endTime, serviceName, interval } });
  },

  async getErrorGroups(teamId: any, startTime: any, endTime: any, params = {}): Promise<any> {
    return api.get(`${BASE}/errors/groups`, { params: { startTime, endTime, ...params } });
  },

  async getServiceErrorRate(teamId: any, startTime: any, endTime: any, serviceName?: string, interval = '5m'): Promise<any> {
    return api.get(`${BASE}/errors/service-error-rate`, { params: { startTime, endTime, serviceName, interval } });
  },

  async getErrorVolume(teamId: any, startTime: any, endTime: any, serviceName?: string, interval = '5m'): Promise<any> {
    return api.get(`${BASE}/errors/error-volume`, { params: { startTime, endTime, serviceName, interval } });
  },

  async getLatencyDuringErrorWindows(teamId: any, startTime: any, endTime: any, serviceName?: string, interval = '5m'): Promise<any> {
    return api.get(`${BASE}/errors/latency-during-error-windows`, { params: { startTime, endTime, serviceName, interval } });
  },
};
