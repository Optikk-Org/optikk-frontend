import axios from 'axios';

import { API_CONFIG } from '@config/apiConfig';

import { attachAuthInterceptor } from './interceptors/authInterceptor';
import { attachErrorInterceptor } from './interceptors/errorInterceptor';
import { attachRetryInterceptor } from './interceptors/retryInterceptor';

interface ApiEnvelope {
  readonly success: boolean;
  readonly data: unknown;
}

function isApiEnvelope(value: unknown): value is ApiEnvelope {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.success === 'boolean' && 'data' in record;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

attachAuthInterceptor(api);
attachRetryInterceptor(api, API_CONFIG.RETRY_ATTEMPTS);
api.interceptors.response.use((response) => {
  const data = response.data;
  if (isApiEnvelope(data)) {
    return data.data;
  }
  return data;
});
attachErrorInterceptor(api);

export { api };
export default api;
