import type { StructuredFilter } from '@hooks/useURLFilters';

import type { QueryParams } from '@services/service-types';

export type DomainRecord = Record<string, unknown>;

export interface LogRecord extends DomainRecord {
  id?: string | number | bigint;
  timestamp?: string | number | Date;
  level?: string;
  service_name?: string;
  serviceName?: string;
  host?: string;
  pod?: string;
  container?: string;
  logger?: string;
  thread?: string;
  traceId?: string;
  trace_id?: string;
  spanId?: string;
  span_id?: string;
  message?: string;
}

export interface LogFacet extends DomainRecord {
  value: string;
  count: number;
}

export interface LogVolumeBucket extends DomainRecord {
  timeBucket?: string;
  time_bucket?: string;
  total?: number;
  errors?: number;
  warnings?: number;
  infos?: number;
  debugs?: number;
  fatals?: number;
}

export interface LogColumn {
  key: string;
  label: string;
  defaultWidth?: number;
  defaultVisible?: boolean;
  flex?: boolean;
}

export interface LogFilterOperator {
  key: string;
  label: string;
  symbol: string;
}

export interface LogFilterField {
  key: string;
  label: string;
  icon: string;
  group: string;
  operators: LogFilterOperator[];
}

export interface LogsBoardRenderContext {
  colWidths: Record<string, number>;
  visibleCols: Record<string, boolean>;
}

export type LogStructuredFilter = StructuredFilter;

export type LogsBackendParams = QueryParams & {
  limit?: number;
  offset?: number;
  search?: string;
  levels?: string[];
  excludeLevels?: string[];
  services?: string[];
  excludeServices?: string[];
  hosts?: string[];
  excludeHosts?: string[];
  pods?: string[];
  containers?: string[];
  loggers?: string[];
  traceId?: string;
  spanId?: string;
};

export interface LogsListResponse {
  logs: LogRecord[];
  total: number;
}

export interface LogsStatsResponse {
  total: number;
  fields: {
    level: LogFacet[];
    service_name: LogFacet[];
  };
}

export interface LogsVolumeResponse {
  step: string;
  buckets: LogVolumeBucket[];
}
