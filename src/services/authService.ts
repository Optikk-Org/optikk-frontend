/**
 * Authentication Service
 */
import api from './api';
import { API_CONFIG, STORAGE_KEYS } from '@config/constants';
import { safeGet, safeSet, safeRemove, safeGetJSON } from '@utils/storage';

export const authService = {
  /**
   * Axios interceptor unwraps ApiResponse and returns payload directly.
   * Keep a compatibility fallback for any wrapped callers.
   */
  normalizeAuthPayload(response) {
    if (!response) return null;
    if (response.success && response.data) return response.data;
    return response;
  },

  /**
   * Login user
   */
  async login(email, password) {
    const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });

    const payload = this.normalizeAuthPayload(response);
    if (payload?.token) {
      // Store auth data
      safeSet(STORAGE_KEYS.AUTH_TOKEN, payload.token);
      safeSet(STORAGE_KEYS.USER_DATA, JSON.stringify(payload.user));

      // Store team ID if available - check both possible locations
      const teamId = payload.currentTeam?.id ||
        payload.teams?.[0]?.id ||
        payload.user?.teams?.[0]?.id;

      if (teamId) {
        safeSet(STORAGE_KEYS.TEAM_ID, teamId);
      }
    }

    return payload || response;
  },

  /**
   * Logout user
   */
  async logout() {
    try {
      await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      safeRemove(STORAGE_KEYS.AUTH_TOKEN);
      safeRemove(STORAGE_KEYS.USER_DATA);
      safeRemove(STORAGE_KEYS.TEAM_ID);
    }
  },

  /**
   * Validate current session
   */
  async validateSession() {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.AUTH.VALIDATE);
      const payload = this.normalizeAuthPayload(response);
      return payload?.valid === true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get current user from storage
   */
  getCurrentUser() {
    return safeGetJSON(STORAGE_KEYS.USER_DATA, null);
  },

  /**
   * Check if user is authenticated (token exists and is not expired).
   */
  isAuthenticated() {
    const token = safeGet(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) return false;
    return !this.isTokenExpired(token);
  },

  /**
   * Decode JWT payload without verification and check the exp claim.
   * Returns true if the token is expired or malformed.
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return false;
      // Consider expired 60 seconds early to avoid edge cases.
      return Date.now() >= (payload.exp * 1000) - 60_000;
    } catch {
      return true;
    }
  },

  /**
   * Returns seconds until the token expires, or 0 if expired/invalid.
   */
  tokenExpiresIn(token: string): number {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) return Infinity;
      return Math.max(0, Math.floor((payload.exp * 1000 - Date.now()) / 1000));
    } catch {
      return 0;
    }
  },

  /**
   * Refresh the current session by calling /api/auth/me and updating stored
   * user data. Returns true if the session is still valid.
   */
  async refreshSession(): Promise<boolean> {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.AUTH.ME);
      const payload = this.normalizeAuthPayload(response);
      if (payload?.user) {
        safeSet(STORAGE_KEYS.USER_DATA, JSON.stringify(payload.user));
        // If the server returns a new token, store it.
        if (payload.token) {
          safeSet(STORAGE_KEYS.AUTH_TOKEN, payload.token);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
};

