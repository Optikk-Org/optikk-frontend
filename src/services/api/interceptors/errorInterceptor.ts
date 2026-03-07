import axios from 'axios';

import { clearAuthStorage } from '@services/auth/authStorage';

import type { AxiosError, AxiosInstance } from 'axios';

/**
 *
 */
export interface ApiErrorShape {
  readonly status: number;
  readonly message: string;
  readonly data?: unknown;
}

function extractApiMessage(data: unknown): string {
  if (typeof data !== 'object' || data === null) {
    return 'An error occurred';
  }

  const record = data as Record<string, unknown>;
  const nestedError = record.error;
  if (typeof nestedError === 'object' && nestedError !== null) {
    const nestedRecord = nestedError as Record<string, unknown>;
    if (typeof nestedRecord.message === 'string' && nestedRecord.message.length > 0) {
      return nestedRecord.message;
    }
  }

  if (typeof record.message === 'string' && record.message.length > 0) {
    return record.message;
  }

  return 'An error occurred';
}

function normalizeError(error: unknown): ApiErrorShape {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data;

      if (status === 401) {
        clearAuthStorage();
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }

      return {
        status,
        message: extractApiMessage(data),
        data,
      };
    }

    if (axiosError.request) {
      return {
        status: 0,
        message: 'Network error - please check your connection',
      };
    }

    return {
      status: 0,
      message: axiosError.message || 'An unexpected error occurred',
    };
  }

  if (error instanceof Error) {
    return {
      status: 0,
      message: error.message,
    };
  }

  return {
    status: 0,
    message: 'An unexpected error occurred',
  };
}

/**
 *
 */
export function attachErrorInterceptor(instance: AxiosInstance): number {
  return instance.interceptors.response.use(
    (response) => response,
    (error: unknown) => Promise.reject(normalizeError(error)),
  );
}
