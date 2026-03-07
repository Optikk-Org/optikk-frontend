/**
 *
 */
export interface ApiError {
  readonly message: string;
  readonly code?: string;
  readonly status?: number;
  readonly [key: string]: unknown;
}

/**
 *
 */
export interface ApiResponseEnvelope<TData> {
  readonly success: boolean;
  readonly data: TData;
  readonly message?: string;
  readonly error?: ApiError;
}
