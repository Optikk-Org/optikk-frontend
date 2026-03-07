import { z } from 'zod';

export const traceSpanSchema = z.object({
  traceId: z.string(),
  spanId: z.string(),
  parentSpanId: z.string().optional(),
  name: z.string(),
  serviceName: z.string(),
  timestamp: z.number(),
  duration: z.number(),
  status: z.string(),
}).passthrough();

export const traceRecordSchema = z.object({
  span_id: z.string(),
  trace_id: z.string(),
  service_name: z.string(),
  operation_name: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  duration_ms: z.number(),
  status: z.string(),
  span_kind: z.string(),
  status_message: z.string().optional(),
  http_method: z.string().optional(),
  http_url: z.string().optional(),
  http_status_code: z.number().optional(),
  service_name_original: z.string().optional(),
  parent_span_id: z.string().optional(),
}).passthrough();

export type TraceRecord = z.infer<typeof traceRecordSchema>;

export const tracesResponseSchema = z.object({
  traces: z.array(traceRecordSchema),
  total: z.number(),
  summary: z.record(z.string(), z.any()).optional(),
});

export type TracesResponse = z.infer<typeof tracesResponseSchema>;
