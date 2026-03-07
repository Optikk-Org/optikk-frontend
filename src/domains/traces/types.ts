/**
 *
 */
export interface TraceRecord extends Record<string, unknown> {
  span_id: string;
  trace_id: string;
  service_name: string;
  operation_name: string;
  start_time: string;
  end_time: string;
  duration_ms: number;
  status: string;
  span_kind: string;
  status_message?: string;
  http_method?: string;
  http_url?: string;
  http_status_code?: number;
  service_name_original?: string;
  parent_span_id?: string;
}

/**
 *
 */
export interface TraceColumn {
  key: string;
  label: string;
  defaultWidth?: number;
  defaultVisible?: boolean;
  flex?: boolean;
}

/**
 *
 */
export type ServiceBadge = [string, number];
