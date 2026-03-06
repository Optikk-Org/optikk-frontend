export type DomainRecord = Record<string, unknown>;

export type ServiceStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
export type ServiceViewMode = 'table' | 'grid';
export type ServiceSortOrder = 'ascend' | 'descend';
export type ServiceSortField =
  | 'serviceName'
  | 'requestCount'
  | 'errorRate'
  | 'avgLatency'
  | 'p95Latency'
  | 'p99Latency';

export interface ServiceMetric extends DomainRecord {
  service_name: string;
  request_count: number;
  error_count: number;
  avg_latency: number;
  p50_latency: number;
  p95_latency: number;
  p99_latency: number;
}

export interface ServiceTimeSeriesPoint extends DomainRecord {
  timestamp: string;
  service_name: string;
  operation_name: string;
  http_method: string;
  request_count: number;
  error_count: number;
  avg_latency: number;
  p50: number;
  p95: number;
  p99: number;
}

export interface ServiceTopologyNode extends DomainRecord {
  name: string;
  requestCount: number;
  errorRate: number;
  avgLatency: number;
  status: string;
  dependencyCount?: number;
  riskScore?: number;
}

export interface ServiceTopologyEdge extends DomainRecord {
  source: string;
  target: string;
  callCount: number;
  avgLatency: number;
  errorRate: number;
}

export interface ServiceTableRow extends DomainRecord {
  serviceName: string;
  errorRate: number;
  requestCount: number;
  errorCount: number;
  avgLatency: number;
  p95Latency: number;
  p99Latency: number;
  status: ServiceStatus;
  requestTrend: number[] | null;
}

export interface ServiceDependencyRow extends DomainRecord {
  key: string;
  source: string;
  target: string;
  sourceStatus: string;
  targetStatus: string;
  callCount: number;
  avgLatency: number;
  errorRate: number;
  risk: number;
}

export interface ServiceTopologyStats {
  graphServices: number;
  dependencies: number;
  criticalServices: number;
  highRiskEdges: number;
}

export interface ServiceHealthOption {
  key: string;
  label: string;
  count: number;
  color?: string;
}

export interface ServicesDataParams {
  searchQuery: string;
  sortField: ServiceSortField | null;
  sortOrder: ServiceSortOrder | null;
  healthFilter: string;
}

export interface ServicesDataResult {
  isLoading: boolean;
  chartDataSources: Record<string, unknown[]>;
  topologyLoading: boolean;
  topologyError: Error | null;
  totalServices: number;
  healthyServices: number;
  degradedServices: number;
  unhealthyServices: number;
  tableData: ServiceTableRow[];
  topologyNodes: ServiceTopologyNode[];
  topologyEdges: ServiceTopologyEdge[];
  topologyStats: ServiceTopologyStats;
  criticalServices: ServiceTopologyNode[];
  dependencyRows: ServiceDependencyRow[];
  healthOptions: ServiceHealthOption[];
}

export interface ServiceEndpointRow extends DomainRecord {
  service_name: string;
  operation_name: string;
  http_method: string;
  request_count: number;
  error_count: number;
  avg_latency: number;
  p95_latency: number;
  p99_latency: number;
}

export interface ServiceErrorGroupRow extends DomainRecord {
  service_name: string;
  operation_name: string;
  status_message: string;
  http_status_code: number;
  error_count: number;
  last_occurrence: string;
  first_occurrence: string;
  sample_trace_id: string;
}

export interface ServiceLogRow extends DomainRecord {
  timestamp: string;
  level: string;
  message: string;
  trace_id: string;
  span_id: string;
}

export interface ServiceDependency extends DomainRecord {
  source: string;
  target: string;
  call_count: number;
}
