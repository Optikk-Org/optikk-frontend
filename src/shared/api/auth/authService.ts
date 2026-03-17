import type { Team, User } from '@/types';

import api from '@shared/api/api/client';

import { API_CONFIG } from '@config/apiConfig';

interface AuthPayload {
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

export const authService = {
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
    const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });

    return this.normalizeAuthPayload(response) || response;
  },

  async logout(): Promise<void> {
    try {
      await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error: unknown) {
      console.error('Logout error:', error);
    }
  },

  async validateSession(): Promise<AuthPayload | null> {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.AUTH.ME);
      return this.normalizeAuthPayload(response);
    } catch {
      return null;
    }
  },

  async refreshSession(): Promise<AuthPayload | null> {
    return this.validateSession();
  },

  async completeOAuthLogin(): Promise<AuthPayload | null> {
    return this.refreshSession();
  },
};
