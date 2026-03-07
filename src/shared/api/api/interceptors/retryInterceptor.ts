import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

interface RetryConfig extends InternalAxiosRequestConfig {
  __retryCount?: number;
}

function shouldRetryRequest(error: AxiosError): boolean {
  const statusCode = error.response?.status;
  if (statusCode && statusCode < 500) {
    return false;
  }

  const method = error.config?.method?.toUpperCase();
  return method === 'GET' || method === 'HEAD';
}

/**
 *
 */
export function attachRetryInterceptor(instance: AxiosInstance, maxRetries: number): number {
  return instance.interceptors.response.use(undefined, async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    if (!config || maxRetries <= 0 || !shouldRetryRequest(error)) {
      return Promise.reject(error);
    }

    config.__retryCount = config.__retryCount || 0;
    if (config.__retryCount >= maxRetries) {
      return Promise.reject(error);
    }

    config.__retryCount += 1;
    const delayMs = Math.min(1000 * 2 ** (config.__retryCount - 1), 10_000);
    await new Promise((resolve) => {
      setTimeout(resolve, delayMs);
    });

    return instance(config);
  });
}
