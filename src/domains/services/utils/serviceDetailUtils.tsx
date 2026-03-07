import { Tag, Progress } from 'antd';
import { APP_COLORS } from '@config/colorLiterals';
import { LOG_LEVELS } from '@config/constants';
import { formatNumber, formatDuration, formatTimestamp } from '@utils/formatters';

const n = (value: unknown): number => (value == null || Number.isNaN(Number(value)) ? 0 : Number(value));

export const getEndpointColumns = () => [
  {
    title: 'Operation',
    dataIndex: 'operation_name',
    key: 'operation_name',
    width: 250,
    render: (text: any) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{text}</span>,
  },
  {
    title: 'Method',
    dataIndex: 'http_method',
    key: 'http_method',
    width: 100,
    render: (method: any) => {
      const methodColors: Record<string, string> = {
        GET: 'blue',
        POST: 'green',
        PUT: 'orange',
        DELETE: 'red',
        PATCH: 'purple',
      };
      const normalizedMethod = String(method || '').toUpperCase();
      return <Tag color={methodColors[normalizedMethod] || 'default'}>{normalizedMethod || '-'}</Tag>;
    },
  },
  {
    title: 'Requests',
    dataIndex: 'request_count',
    key: 'request_count',
    width: 120,
    render: (count: any) => formatNumber(count),
    sorter: (left: any, right: any) => n(left.request_count) - n(right.request_count),
  },
  {
    title: 'Error Rate',
    key: 'error_rate',
    width: 150,
    render: (_value: any, record: any) => {
      const requests = n(record.request_count);
      const errors = n(record.error_count);
      const rate = requests > 0 ? (errors / requests) * 100 : 0;
      const color = rate > 5 ? APP_COLORS.hex_f04438 : rate > 1 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_12b76a;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress
            percent={Math.min(rate, 100)}
            size="small"
            strokeColor={color}
            showInfo={false}
            style={{ flex: 1 }}
          />
          <span style={{ color, minWidth: 50, fontSize: 12 }}>{Number(rate).toFixed(2)}%</span>
        </div>
      );
    },
    sorter: (left: any, right: any) => {
      const rateLeft = n(left.request_count) > 0 ? n(left.error_count) / n(left.request_count) : 0;
      const rateRight = n(right.request_count) > 0 ? n(right.error_count) / n(right.request_count) : 0;
      return rateLeft - rateRight;
    },
  },
  {
    title: 'Avg Latency',
    dataIndex: 'avg_latency',
    key: 'avg_latency',
    width: 120,
    render: (latency: any) => formatDuration(latency),
    sorter: (left: any, right: any) => n(left.avg_latency) - n(right.avg_latency),
  },
  {
    title: 'P95',
    dataIndex: 'p95_latency',
    key: 'p95_latency',
    width: 120,
    render: (latency: any) => formatDuration(latency),
    sorter: (left: any, right: any) => n(left.p95_latency) - n(right.p95_latency),
  },
  {
    title: 'P99',
    dataIndex: 'p99_latency',
    key: 'p99_latency',
    width: 120,
    render: (latency: any) => formatDuration(latency || 0),
    sorter: (left: any, right: any) => n(left.p99_latency) - n(right.p99_latency),
  },
];

export const getErrorColumns = (handlers: { navigate: (path: string) => void }) => [
  {
    title: 'Error Message',
    dataIndex: 'status_message',
    key: 'status_message',
    width: 300,
    render: (text: any) => (
      <span style={{ fontFamily: 'monospace', color: APP_COLORS.hex_f04438, fontSize: 12 }}>
        {text || 'Unknown error'}
      </span>
    ),
  },
  {
    title: 'Operation',
    dataIndex: 'operation_name',
    key: 'operation_name',
    width: 200,
    render: (text: any) => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{text}</span>,
  },
  {
    title: 'Status Code',
    dataIndex: 'http_status_code',
    key: 'http_status_code',
    width: 120,
    render: (code: any) => {
      const statusCode = n(code);
      const color = statusCode >= 500 ? 'red' : statusCode >= 400 ? 'orange' : 'default';
      return <Tag color={color}>{statusCode || 'N/A'}</Tag>;
    },
  },
  {
    title: 'Count',
    dataIndex: 'error_count',
    key: 'error_count',
    width: 100,
    render: (count: any) => <span style={{ fontWeight: 600 }}>{formatNumber(count)}</span>,
    sorter: (left: any, right: any) => n(left.error_count) - n(right.error_count),
  },
  {
    title: 'Last Seen',
    dataIndex: 'last_occurrence',
    key: 'last_occurrence',
    width: 180,
    render: (timestamp: any) => {
      if (!timestamp) return '-';
      return <span style={{ fontSize: 12 }}>{formatTimestamp(timestamp)}</span>;
    },
  },
  {
    title: 'Sample Trace',
    dataIndex: 'sample_trace_id',
    key: 'sample_trace_id',
    width: 150,
    render: (traceId: any) => {
      if (!traceId) return '-';
      return (
        <a
          onClick={() => handlers.navigate(`/traces/${traceId}`)}
          style={{ color: APP_COLORS.hex_1890ff, cursor: 'pointer', fontSize: 12 }}
        >
          View Trace
        </a>
      );
    },
  },
];

export const getLogColumns = (handlers: { navigate: (path: string) => void }) => [
  {
    title: 'Timestamp',
    dataIndex: 'timestamp',
    key: 'timestamp',
    width: 180,
    render: (timestamp: any) => formatTimestamp(timestamp),
  },
  {
    title: 'Level',
    dataIndex: 'level',
    key: 'level',
    width: 100,
    render: (level: any) => {
      const levelKey = String(level || 'INFO').toUpperCase() as keyof typeof LOG_LEVELS;
      const config = LOG_LEVELS[levelKey] || LOG_LEVELS.INFO;
      return <Tag color={config.color}>{config.label}</Tag>;
    },
  },
  {
    title: 'Message',
    dataIndex: 'message',
    key: 'message',
    ellipsis: true,
    render: (message: any) => (
      <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{message || '-'}</span>
    ),
  },
  {
    title: 'Trace',
    dataIndex: 'trace_id',
    key: 'trace_id',
    width: 150,
    render: (traceId: any) => {
      if (!traceId) return '-';
      return (
        <a
          onClick={() => handlers.navigate(`/traces/${traceId}`)}
          style={{ color: APP_COLORS.hex_1890ff, cursor: 'pointer', fontSize: 11 }}
        >
          {String(traceId).substring(0, 16)}...
        </a>
      );
    },
  },
];
