/**
 * Metrics Service — API calls for core metrics (services, endpoints, timeseries).
 */
import api from './api';
import { API_CONFIG } from '@config/constants';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

export interface ServiceMetric {
    serviceName: string;
    requestCount: number;
    errorCount: number;
    errorRate: number;
    avgLatency: number;
    p50Latency: number;
    p95Latency: number;
    p99Latency: number;
    [key: string]: any;
}

export interface EndpointMetric extends ServiceMetric {
    operationName: string;
    httpMethod: string;
}

export interface TimeSeriesPoint {
    timestamp: string;
    serviceName: string;
    operationName?: string;
    httpMethod?: string;
    requestCount: number;
    errorCount: number;
    avgLatency: number;
    [key: string]: any;
}

export interface MetricsSummary {
    totalRequests: number;
    errorCount: number;
    errorRate: number;
    avgLatency: number;
    p95Latency: number;
    p99Latency: number;
}

// Normalizes a service metric row from snake_case (new modules) preserving
// camelCase aliases so existing metric page consumers keep working.
function normalizeServiceMetric(s: any): ServiceMetric {
    return {
        ...s,
        serviceName: s.service_name ?? s.serviceName ?? '',
        requestCount: s.request_count ?? s.requestCount ?? 0,
        errorCount: s.error_count ?? s.errorCount ?? 0,
        errorRate: s.error_rate ?? s.errorRate ?? 0,
        avgLatency: s.avg_latency ?? s.avgLatency ?? 0,
        p50Latency: s.p50_latency ?? s.p50Latency ?? 0,
        p95Latency: s.p95_latency ?? s.p95Latency ?? 0,
        p99Latency: s.p99_latency ?? s.p99Latency ?? 0,
    };
}

function normalizeEndpointMetric(e: any): EndpointMetric {
    return {
        ...e,
        serviceName: e.service_name ?? e.serviceName ?? '',
        operationName: e.operation_name ?? e.operationName ?? '',
        httpMethod: e.http_method ?? e.httpMethod ?? '',
        requestCount: e.request_count ?? e.requestCount ?? 0,
        errorCount: e.error_count ?? e.errorCount ?? 0,
        avgLatency: e.avg_latency ?? e.avgLatency ?? 0,
        p50Latency: e.p50_latency ?? e.p50Latency ?? 0,
        p95Latency: e.p95_latency ?? e.p95Latency ?? 0,
        p99Latency: e.p99_latency ?? e.p99Latency ?? 0,
    };
}

function normalizeTimeSeriesPoint(p: any): TimeSeriesPoint {
    return {
        ...p,
        serviceName: p.service_name ?? p.serviceName ?? '',
        operationName: p.operation_name ?? p.operationName ?? '',
        httpMethod: p.http_method ?? p.httpMethod ?? '',
        requestCount: p.request_count ?? p.requestCount ?? 0,
        errorCount: p.error_count ?? p.errorCount ?? 0,
        avgLatency: p.avg_latency ?? p.avgLatency ?? 0,
    };
}

export const metricsService = {
    async getServiceMetrics(teamId: number | null, startTime: string | number, endTime: string | number): Promise<ServiceMetric[]> {
        const rows = await api.get(`${BASE}/services/metrics`, { params: { startTime, endTime } });
        return Array.isArray(rows) ? rows.map(normalizeServiceMetric) : [];
    },

    async getEndpointMetrics(teamId: number | null, startTime: string | number, endTime: string | number, serviceName: string): Promise<EndpointMetric[]> {
        const rows = await api.get(`${BASE}/endpoints/metrics`, { params: { startTime, endTime, serviceName } });
        return Array.isArray(rows) ? rows.map(normalizeEndpointMetric) : [];
    },

    async getEndpointTimeSeries(teamId: number | null, startTime: string | number, endTime: string | number, serviceName: string): Promise<TimeSeriesPoint[]> {
        const rows = await api.get(`${BASE}/endpoints/timeseries`, { params: { startTime, endTime, serviceName } });
        return Array.isArray(rows) ? rows.map(normalizeTimeSeriesPoint) : [];
    },

    async getMetricsTimeSeries(teamId: number | null, startTime: string | number, endTime: string | number, serviceName?: string, interval?: string): Promise<TimeSeriesPoint[]> {
        const rows = await api.get(`${BASE}/metrics/timeseries`, { params: { startTime, endTime, serviceName, interval } });
        return Array.isArray(rows) ? rows.map(normalizeTimeSeriesPoint) : [];
    },

    async getMetricsSummary(teamId: number | null, startTime: string | number, endTime: string | number): Promise<MetricsSummary> {
        const res: any = await api.get(`${BASE}/metrics/summary`, { params: { startTime, endTime } });
        // Map snake_case (new overview module) to camelCase for existing consumers.
        return {
            totalRequests: res?.total_requests ?? res?.totalRequests ?? 0,
            errorCount: res?.error_count ?? res?.errorCount ?? 0,
            errorRate: res?.error_rate ?? res?.errorRate ?? 0,
            avgLatency: res?.avg_latency ?? res?.avgLatency ?? 0,
            p95Latency: res?.p95_latency ?? res?.p95Latency ?? 0,
            p99Latency: res?.p99_latency ?? res?.p99Latency ?? 0,
        };
    },

    async getServiceTimeSeries(teamId: number | null, startTime: string | number, endTime: string | number, interval = '5m'): Promise<any> {
        return api.get(`${BASE}/services/timeseries`, { params: { startTime, endTime, interval } });
    },

    // ── Services ────────────────────────────────────────────────────────────
    async getServiceDependencies(teamId: number | null, startTime: string | number, endTime: string | number): Promise<any> {
        return api.get(`${BASE}/services/dependencies`, { params: { startTime, endTime } });
    },

    async getEndpointBreakdown(teamId: number | null, startTime: string | number, endTime: string | number, serviceName: string): Promise<any> {
        return api.get(`${BASE}/services/${serviceName}/endpoints`, { params: { startTime, endTime } });
    },

    async getErrorGroups(teamId: number | null, startTime: string | number, endTime: string | number, serviceName: string): Promise<any> {
        return api.get(`${BASE}/services/${serviceName}/errors`, { params: { startTime, endTime } });
    },

    // ── Error Dashboard ─────────────────────────────────────────────────────
    async getGlobalErrorGroups(teamId: number | null, startTime: string | number, endTime: string | number, params = {}): Promise<any> {
        return api.get(`${BASE}/errors/groups`, { params: { startTime, endTime, ...params } });
    },

    async getErrorTimeSeries(teamId: number | null, startTime: string | number, endTime: string | number, interval = '5m', serviceName?: string): Promise<any> {
        return api.get(`${BASE}/errors/timeseries`, { params: { startTime, endTime, interval, serviceName } });
    },

    // ── Incidents ───────────────────────────────────────────────────────────
    async getIncidents(teamId: number | null, startTime: string | number, endTime: string | number, params = {}): Promise<any> {
        return api.get(`${BASE}/incidents`, { params: { startTime, endTime, ...params } });
    },

    // ── Infrastructure / Resource Utilization ───────────────────────────────
    async getAvgCPU(teamId: number | null, startTime: string | number, endTime: string | number): Promise<any> {
        return api.get(`${BASE}/infrastructure/resource-utilisation/avg-cpu`, { params: { startTime, endTime } });
    },

    async getAvgMemory(teamId: number | null, startTime: string | number, endTime: string | number): Promise<any> {
        return api.get(`${BASE}/infrastructure/resource-utilisation/avg-memory`, { params: { startTime, endTime } });
    },

    async getAvgNetwork(teamId: number | null, startTime: string | number, endTime: string | number): Promise<any> {
        return api.get(`${BASE}/infrastructure/resource-utilisation/avg-network`, { params: { startTime, endTime } });
    },

    async getAvgConnPool(teamId: number | null, startTime: string | number, endTime: string | number): Promise<any> {
        return api.get(`${BASE}/infrastructure/resource-utilisation/avg-conn-pool`, { params: { startTime, endTime } });
    },

    async getCPUUsagePercentage(teamId: number | null, startTime: string | number, endTime: string | number): Promise<any> {
        return api.get(`${BASE}/infrastructure/resource-utilisation/cpu-usage-percentage`, { params: { startTime, endTime } });
    },

    async getMemoryUsagePercentage(teamId: number | null, startTime: string | number, endTime: string | number): Promise<any> {
        return api.get(`${BASE}/infrastructure/resource-utilisation/memory-usage-percentage`, { params: { startTime, endTime } });
    },

    async getResourceUsageByService(teamId: number | null, startTime: string | number, endTime: string | number): Promise<any> {
        return api.get(`${BASE}/infrastructure/resource-utilisation/by-service`, { params: { startTime, endTime } });
    },

    async getResourceUsageByInstance(teamId: number | null, startTime: string | number, endTime: string | number): Promise<any> {
        return api.get(`${BASE}/infrastructure/resource-utilisation/by-instance`, { params: { startTime, endTime } });
    },

    // ── Infrastructure Nodes ────────────────────────────────────────────────
    async getNodeHealth(teamId: number | null, startTime: string | number, endTime: string | number): Promise<any> {
        return api.get(`${BASE}/infrastructure/nodes`, { params: { startTime, endTime } });
    },

    async getNodeServices(teamId: number | null, host: string, startTime: string | number, endTime: string | number): Promise<any> {
        return api.get(`${BASE}/infrastructure/nodes/${encodeURIComponent(host)}/services`, {
            params: { startTime, endTime },
        });
    },

};
