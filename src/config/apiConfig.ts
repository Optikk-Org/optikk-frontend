export const API_PROXY_BASE = '/api';
export const API_TIMEOUT_MS = 30000;
export const API_RETRY_ATTEMPTS = 3;

export const DEV_FRONTEND_PORT = 3000;
export const DEV_BACKEND_HOST = 'localhost';
export const DEV_BACKEND_PORT = 9090;
export const DEV_BACKEND_URL = `http://${DEV_BACKEND_HOST}:${DEV_BACKEND_PORT}`;
export const API_V1_BASE = '/v1';

export const API_ENDPOINTS = {
  V1_BASE: API_V1_BASE,
  AUTH: {
    LOGIN: `${API_V1_BASE}/auth/login`,
    LOGOUT: `${API_V1_BASE}/auth/logout`,
    VALIDATE: `${API_V1_BASE}/auth/validate`,
    ME: `${API_V1_BASE}/auth/me`,
  },
  TEAMS: {
    LIST: `${API_V1_BASE}/teams`,
    SWITCH: `${API_V1_BASE}/teams/switch`,
  },
  SETTINGS: {
    PROFILE: `${API_V1_BASE}/settings/profile`,
    PREFERENCES: `${API_V1_BASE}/settings/preferences`,
  },
  EVENTS: {
    STREAM: `${API_V1_BASE}/events/stream`,
  },
} as const;

export const API_CONFIG = {
  BASE_URL: API_PROXY_BASE,
  TIMEOUT: API_TIMEOUT_MS,
  RETRY_ATTEMPTS: API_RETRY_ATTEMPTS,
  ENDPOINTS: API_ENDPOINTS,
} as const;
