import { z } from "zod";

import api from "@/shared/api/api/client";
import { decodeApiResponse } from "@/shared/api/utils/validate";
import { API_CONFIG } from "@config/apiConfig";

import { estimateCost } from "../utils/costCalculator";

import type { AIExplorerResponse } from "../types";

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

const facetBucketSchema = z.object({
  value: z.string(),
  count: z.number(),
});

const aiExplorerFacetsSchema = z.object({
  ai_system: z.array(facetBucketSchema).default([]),
  ai_model: z.array(facetBucketSchema).default([]),
  ai_operation: z.array(facetBucketSchema).default([]),
  service_name: z.array(facetBucketSchema).default([]),
  status: z.array(facetBucketSchema).default([]),
  finish_reason: z.array(facetBucketSchema).default([]),
});

const aiSummarySchema = z.object({
  total_calls: z.number().default(0),
  error_calls: z.number().default(0),
  avg_latency_ms: z.number().default(0),
  p50_latency_ms: z.number().default(0),
  p95_latency_ms: z.number().default(0),
  p99_latency_ms: z.number().default(0),
  total_input_tokens: z.number().default(0),
  total_output_tokens: z.number().default(0),
});

const aiCallSchema = z.object({
  span_id: z.string(),
  trace_id: z.string(),
  service_name: z.string(),
  operation_name: z.string(),
  start_time: z.string(),
  duration_ms: z.number(),
  status: z.string(),
  status_message: z.string().optional().default(""),
  ai_system: z.string().default(""),
  ai_request_model: z.string().default(""),
  ai_response_model: z.string().optional().default(""),
  ai_operation: z.string().default(""),
  input_tokens: z.number().default(0),
  output_tokens: z.number().default(0),
  total_tokens: z.number().default(0),
  temperature: z.string().optional().default(""),
  max_tokens: z.string().optional().default(""),
  finish_reason: z.string().optional().default(""),
  error_type: z.string().optional().default(""),
});

const aiTrendBucketSchema = z.object({
  time_bucket: z.string(),
  total_calls: z.number(),
  error_calls: z.number(),
  avg_latency_ms: z.number(),
  total_tokens: z.number(),
});

const aiExplorerResponseSchema = z.object({
  results: z.array(aiCallSchema).default([]),
  summary: aiSummarySchema,
  facets: aiExplorerFacetsSchema,
  trend: z.array(aiTrendBucketSchema).default([]),
  pageInfo: z.object({
    total: z.number().default(0),
    offset: z.number().default(0),
    limit: z.number().default(50),
  }),
});

export const aiExplorerApi = {
  async query(body: {
    startTime: number;
    endTime: number;
    limit: number;
    offset: number;
    step: string;
    query: string;
  }): Promise<AIExplorerResponse> {
    const response = await api.post(`${BASE}/ai/explorer/query`, body);
    const parsed = decodeApiResponse(aiExplorerResponseSchema, response, {
      context: "ai explorer",
      expectedType: "object",
      message: "Invalid AI explorer response",
    });

    // Enrich each record with client-side estimated cost.
    const results = parsed.results.map((record) => ({
      ...record,
      estimated_cost: estimateCost(
        record.ai_request_model,
        record.input_tokens,
        record.output_tokens
      ),
    }));

    return { ...parsed, results };
  },
};
