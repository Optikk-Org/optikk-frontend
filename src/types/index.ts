export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: {
        message: string;
        code?: string;
        [key: string]: any;
    };
}

export interface User {
    id: string;
    email: string;
    name?: string;
    teams: Team[];
    [key: string]: any;
}

export interface Team {
    id: number;
    name: string;
    [key: string]: any;
}

export interface TimeRange {
    label: string;
    value: string;
    minutes?: number;
    start?: number;
    end?: number;
    startTime?: any;
    endTime?: any;
}

export interface MetricData {
    timestamp: string;
    value: number;
    [key: string]: any;
}

export interface LogEntry {
    id: string;
    timestamp: string;
    level: string;
    message: string;
    service: string;
    [key: string]: any;
}

export interface TraceSpan {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    name: string;
    serviceName: string;
    timestamp: number;
    duration: number;
    status: string;
    [key: string]: any;
}
