/** A single AI/LLM call record returned by the AI explorer API. */
export type AICallRecord = {
  span_id: string;
  trace_id: string;
  service_name: string;
  operation_name: string;
  start_time: string;
  duration_ms: number;
  status: string;
  status_message?: string;

  ai_system: string;
  ai_request_model: string;
  ai_response_model?: string;
  ai_operation: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  temperature?: string;
  max_tokens?: string;
  finish_reason?: string;
  error_type?: string;

  /** Computed client-side from model pricing table. */
  estimated_cost: number;
};

export interface AISummary {
  total_calls: number;
  error_calls: number;
  avg_latency_ms: number;
  p50_latency_ms: number;
  p95_latency_ms: number;
  p99_latency_ms: number;
  total_input_tokens: number;
  total_output_tokens: number;
}

export interface AIFacetBucket {
  value: string;
  count: number;
}

export interface AIExplorerFacets {
  ai_system: AIFacetBucket[];
  ai_model: AIFacetBucket[];
  ai_operation: AIFacetBucket[];
  service_name: AIFacetBucket[];
  status: AIFacetBucket[];
  finish_reason: AIFacetBucket[];
}

export interface AITrendBucket {
  time_bucket: string;
  total_calls: number;
  error_calls: number;
  avg_latency_ms: number;
  total_tokens: number;
}

export interface AIExplorerResponse {
  results: AICallRecord[];
  summary: AISummary;
  facets: AIExplorerFacets;
  trend: AITrendBucket[];
  pageInfo: {
    total: number;
    offset: number;
    limit: number;
  };
}
