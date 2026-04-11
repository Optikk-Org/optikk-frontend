import { formatDuration, formatNumber } from "@shared/utils/formatters";
import { useMemo } from "react";

import type { AICallRecord } from "../types";
import { formatCost } from "../utils/costCalculator";

/**
 * Maps an AI call record to detail panel fields grouped by category.
 */
export function useAICallDetail(record: AICallRecord | null) {
  return useMemo(() => {
    if (!record) return [];

    return [
      // --- Model & Provider ---
      { key: "ai_system", label: "Provider", value: record.ai_system, filterable: true },
      { key: "ai_request_model", label: "Model", value: record.ai_request_model, filterable: true },
      {
        key: "ai_response_model",
        label: "Response model",
        value: record.ai_response_model,
        filterable: false,
      },
      { key: "ai_operation", label: "Operation", value: record.ai_operation, filterable: true },

      // --- Tokens & Cost ---
      {
        key: "input_tokens",
        label: "Input tokens",
        value: record.input_tokens ? formatNumber(record.input_tokens) : null,
        filterable: false,
      },
      {
        key: "output_tokens",
        label: "Output tokens",
        value: record.output_tokens ? formatNumber(record.output_tokens) : null,
        filterable: false,
      },
      {
        key: "total_tokens",
        label: "Total tokens",
        value: record.total_tokens ? formatNumber(record.total_tokens) : null,
        filterable: false,
      },
      {
        key: "estimated_cost",
        label: "Estimated cost",
        value: record.estimated_cost > 0 ? formatCost(record.estimated_cost) : null,
        filterable: false,
      },

      // --- Request Parameters ---
      { key: "temperature", label: "Temperature", value: record.temperature, filterable: false },
      { key: "max_tokens", label: "Max tokens", value: record.max_tokens, filterable: false },

      // --- Response ---
      {
        key: "finish_reason",
        label: "Finish reason",
        value: record.finish_reason,
        filterable: true,
      },
      { key: "status", label: "Status", value: record.status, filterable: true },
      { key: "error_type", label: "Error type", value: record.error_type, filterable: false },
      {
        key: "status_message",
        label: "Error message",
        value: record.status_message,
        filterable: false,
      },

      // --- Trace Context ---
      { key: "trace_id", label: "Trace ID", value: record.trace_id, filterable: false },
      { key: "span_id", label: "Span ID", value: record.span_id, filterable: false },
      {
        key: "service_name",
        label: "Service",
        value: record.service_name,
        filterable: true,
      },
      {
        key: "operation_name",
        label: "Span operation",
        value: record.operation_name,
        filterable: false,
      },
      {
        key: "duration_ms",
        label: "Latency",
        value: formatDuration(record.duration_ms),
        filterable: false,
      },
    ].filter((field) => Boolean(field.value));
  }, [record]);
}
