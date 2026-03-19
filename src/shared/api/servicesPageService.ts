import { API_CONFIG } from '@config/apiConfig';
import { z } from 'zod';

import api from './api';
import { validateResponse } from './utils/validate';
import { serviceSummarySchema } from './schemas/servicesSchemas';

import type { ServiceSummary } from './schemas/servicesSchemas';
import type { RequestTime } from './service-types';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

/**
 * Service wrapper for services-page endpoints.
 */
export const servicesPageService = {
  async getTotalServices(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/services/summary/total`, { params: { startTime, endTime } });
  },

  async getHealthyServices(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/services/summary/healthy`, { params: { startTime, endTime } });
  },

  async getDegradedServices(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/services/summary/degraded`, { params: { startTime, endTime } });
  },

  async getUnhealthyServices(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/services/summary/unhealthy`, { params: { startTime, endTime } });
  },

  async getServiceMetrics(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<ServiceSummary[]> {
    const data = await api.get(`${BASE}/services/metrics`, { params: { startTime, endTime } });
    return validateResponse(z.array(serviceSummarySchema), data);
  },

  async getServiceTimeSeries(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
    interval = '5m',
  ): Promise<unknown> {
    return api.get(`${BASE}/services/timeseries`, { params: { startTime, endTime, interval } });
  },

  async getTopology(
    _teamId: number | null,
    startTime: RequestTime,
    endTime: RequestTime,
  ): Promise<unknown> {
    return api.get(`${BASE}/services/topology`, { params: { startTime, endTime } });
  },
};
