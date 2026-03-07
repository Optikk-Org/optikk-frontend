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
