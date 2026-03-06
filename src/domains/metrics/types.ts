export type DomainRecord = Record<string, unknown>;

export interface MetricsServiceOption extends DomainRecord {
  name?: string;
  service_name?: string;
  serviceName?: string;
}

export interface MetricSummary extends DomainRecord {
  total_requests: number;
  error_count: number;
  error_rate: number;
  avg_latency: number;
  p95_latency: number;
  p99_latency: number;
}

export interface MetricTimeSeriesPoint extends DomainRecord {
  timestamp: string;
  request_count: number;
  error_count: number;
  avg_latency: number;
  p50: number;
  p95: number;
  p99: number;
}

export interface ServiceMetricPoint extends DomainRecord {
  service_name: string;
  request_count: number;
  error_count: number;
  avg_latency: number;
  p50_latency: number;
  p95_latency: number;
  p99_latency: number;
}

export interface EndpointMetricPoint extends ServiceMetricPoint {
  operation_name: string;
  http_method: string;
}

export interface UseMetricsQueriesParams {
  selectedService: string | null;
  showErrorsOnly: boolean;
  activeTab: 'overview' | 'latency' | 'services';
}

export interface UseMetricsQueriesResult {
  servicesData: MetricsServiceOption[] | undefined;
  summaryData: MetricSummary | undefined;
  summaryLoading: boolean;
  metricsData: MetricTimeSeriesPoint[] | undefined;
  metricsLoading: boolean;
  serviceMetricsData: ServiceMetricPoint[] | undefined;
  endpointMetricsData: EndpointMetricPoint[] | undefined;
  endpointTimeSeriesData: MetricTimeSeriesPoint[] | undefined;
}
