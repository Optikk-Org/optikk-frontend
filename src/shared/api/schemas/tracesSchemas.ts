import { z } from 'zod';

export const traceRecordSchema = z.object({
  span_id: z.string(),
  trace_id: z.string(),
  service_name: z.string().default(''),
  operation_name: z.string().default(''),
  start_time: z.string().default(''),
  end_time: z.string().default(''),
  duration_ms: z.number().default(0),
  status: z.string().default('UNSET'),
  span_kind: z.string().default(''),
  status_message: z.string().optional(),
  http_method: z.string().optional(),
  http_url: z.string().optional(),
  http_status_code: z.number().optional(),
  service_name_original: z.string().optional(),
  parent_span_id: z.string().optional(),
}).passthrough();

export const spanRecordSchema = z.object({
  span_id: z.string(),
  trace_id: z.string().default(''),
  parent_span_id: z.string().optional(),
  service_name: z.string().default(''),
  operation_name: z.string().default(''),
  start_time: z.string().default(''),
  end_time: z.string().default(''),
  duration_ms: z.number().default(0),
  status: z.string().default('UNSET'),
  span_kind: z.string().default(''),
}).passthrough();

export const tracesSummarySchema = z.record(z.string(), z.unknown()).default({});

export type TraceRecord = z.infer<typeof traceRecordSchema>;
export type SpanRecord = z.infer<typeof spanRecordSchema>;
