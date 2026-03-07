/**
 *
 */
export interface PaginationRequest {
  readonly limit?: number;
  readonly offset?: number;
}

/**
 *
 */
export interface PaginationMeta {
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}
