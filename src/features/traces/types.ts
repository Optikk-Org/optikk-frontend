/**
 *
 */
import { type TraceRecord as EntityTraceRecord } from '@/entities/trace/model';

export type TraceRecord = EntityTraceRecord;

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

// ── Trace Detail Enhancement Types ────────────────────────────────────────────

export interface SpanEvent {
  spanId: string;
  traceId: string;
  eventName: string;
  timestamp: string;
  attributes: string; // JSON string
}

export interface SpanKindDuration {
  spanKind: string;
  totalDurationMs: number;
  spanCount: number;
  pctOfTrace: number;
}

export interface CriticalPathSpan {
  spanId: string;
  operationName: string;
  serviceName: string;
  durationMs: number;
}

export interface SpanSelfTime {
  spanId: string;
  operationName: string;
  totalDurationMs: number;
  selfTimeMs: number;
  childTimeMs: number;
}

export interface ErrorPathSpan {
  spanId: string;
  parentSpanId: string;
  operationName: string;
  serviceName: string;
  status: string;
  statusMessage: string;
  startTime: string;
  durationMs: number;
}

export interface SpanAttributes {
  spanId: string;
  traceId: string;
  operationName: string;
  serviceName: string;
  attributesString: Record<string, string>;
  resourceAttributes: Record<string, string>;
  exceptionType?: string;
  exceptionMessage?: string;
  exceptionStacktrace?: string;
  dbSystem?: string;
  dbName?: string;
  dbStatement?: string;
  dbStatementNormalized?: string;
  attributes?: Record<string, string>;
}

export interface RelatedTrace {
  traceId: string;
  spanId: string;
  operationName: string;
  serviceName: string;
  durationMs: number;
  status: string;
  startTime: string;
}

// ── Analytics & Comparison Types ──────────────────────────────────────────────

export interface AnalyticsDimension {
  key: string;
  type: 'string' | 'number' | 'boolean';
  description?: string;
}

export interface AnalyticsQuery {
  dimensions: string[];
  metrics: string[];
  filters: Record<string, any>;
  startTime: number;
  endTime: number;
}

export interface TraceComparisonResult {
  traceA: string;
  traceB: string;
  structuralDifferences: any[];
  timingDifferences: any[];
}

export interface FlamegraphNode {
  name: string;
  value: number;
  children?: FlamegraphNode[];
  metadata?: Record<string, any>;
}

export interface REDMetricsSummary {
  requestRate: number;
  errorRate: number;
  p95Latency: number;
  timestamp: string;
}
