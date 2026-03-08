import type { Team, User } from '@/types';

import api from '@shared/api/api/client';

import { API_CONFIG } from '@config/apiConfig';

import {
  clearAuthPresentFlag,
  clearAuthStorage,
  getStoredUser,
  isAuthPresent,
  resolveTeamId,
  setAuthPresentFlag,
  setStoredTeamId,
  setStoredToken,
  setStoredUser,
} from './authStorage';

interface AuthPayload {
  readonly token?: string;
  readonly user?: User;
  readonly teams?: Team[];
  readonly currentTeam?: Team;
  readonly success?: boolean;
  readonly data?: unknown;
  readonly [key: string]: unknown;
}

function asAuthPayload(value: unknown): AuthPayload | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  return value as AuthPayload;
}

export /**
 *
 */
const authService = {
  normalizeAuthPayload(response: unknown): AuthPayload | null {
    const payload = asAuthPayload(response);
    if (!payload) {
      return null;
    }
    if (payload.success === true) {
      return asAuthPayload(payload.data);
    }
    return payload;
  },

  async login(email: string, password: string): Promise<AuthPayload | unknown> {
    clearAuthStorage();

    const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });

    const payload = this.normalizeAuthPayload(response);
    if (payload?.user) {
      setAuthPresentFlag();
      setStoredUser(payload.user);

      const teamId = resolveTeamId(payload);
      if (teamId != null) {
        setStoredTeamId(teamId);
      }

      if (payload.token) {
        setStoredToken(String(payload.token));
      }
    }

    return payload || response;
  },

  async logout(): Promise<void> {
    try {
      await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error: unknown) {
      console.error('Logout error:', error);
    } finally {
      clearAuthStorage();
    }
  },

  async validateSession(): Promise<boolean> {
    try {
      await api.get(API_CONFIG.ENDPOINTS.AUTH.ME);
      return true;
    } catch (_error: unknown) {
      clearAuthPresentFlag();
      return false;
    }
  },

  isAuthenticated(): boolean {
    return isAuthPresent();
  },

  getCurrentUser(): User | null {
    return getStoredUser();
  },

  async refreshSession(): Promise<boolean> {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.AUTH.ME);
      const payload = this.normalizeAuthPayload(response);
      if (payload?.user) {
        setAuthPresentFlag();
        setStoredUser(payload.user);
        return true;
      }
      return false;
    } catch (_error: unknown) {
      return false;
    }
  },

  /**
   * Stores a JWT received from an OAuth redirect and fetches the user profile.
   * Used by the /oauth/success callback page.
   */
  async loginWithToken(token: string): Promise<void> {
    clearAuthStorage();
    setStoredToken(token);
    setAuthPresentFlag();

    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.AUTH.ME);
      const payload = this.normalizeAuthPayload(response);
      if (payload?.user) {
        setStoredUser(payload.user as never);

        const teamId = resolveTeamId(payload);
        if (teamId != null) {
          setStoredTeamId(teamId);
        }
      }
    } catch (_error: unknown) {
      // Auth flag + token are already set; user/team will load lazily
    }
  },
};
