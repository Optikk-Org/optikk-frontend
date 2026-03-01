/**
 * API Service - Axios instance with interceptors
 */
import axios from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '@config/constants';
import { safeGet, safeRemove } from '@utils/storage';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    // Disable browser/proxy response caching for telemetry queries.
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers.Pragma = 'no-cache';
    config.headers.Expires = '0';

    const token = safeGet(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add team ID to headers if available
    const teamId = safeGet(STORAGE_KEYS.TEAM_ID);
    if (teamId) {
      config.headers['X-Team-ID'] = teamId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    const data = response.data;
    // Unwrap ApiResponse if present (has success and data properties)
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      return data.data;
    }
    return data;
  },
  (error: any) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - clear auth and fire event for the React app to handle.
        // Using a custom DOM event avoids the hard window.location.href redirect
        // that used to destroy all SPA state.
        safeRemove(STORAGE_KEYS.AUTH_TOKEN);
        safeRemove(STORAGE_KEYS.USER_DATA);
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }

      return Promise.reject({
        status,
        message: data?.error?.message || data?.message || 'An error occurred',
        data: data,
      });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        status: 0,
        message: 'Network error - please check your connection',
      });
    } else {
      // Something else happened
      return Promise.reject({
        status: 0,
        message: error.message || 'An unexpected error occurred',
      });
    }
  }
);

export default api;

