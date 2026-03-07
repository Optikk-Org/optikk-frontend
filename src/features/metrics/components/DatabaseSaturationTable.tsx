import { Tag, Table, Skeleton, Empty } from 'antd';
import React from 'react';
import { APP_COLORS } from '@config/colorLiterals';
import { formatNumber, formatDuration } from '@shared/utils/formatters';

interface DatabaseMetric {
  table_name: string;
  query_count: number;
  avg_latency_ms: number;
  [key: string]: unknown;
}

interface DatabaseSaturationTableProps {
  data: DatabaseMetric[];
  loading: boolean;
}

export const DatabaseSaturationTable: React.FC<DatabaseSaturationTableProps> = ({ data, loading }) => {
  const columns = [
    {
      title: 'Table Name',
      dataIndex: 'table_name',
      key: 'table_name',
      render: (v: string) => (
        <Tag style={{ 
          background: APP_COLORS.rgba_94_96_206_0p15_2, 
          color: APP_COLORS.hex_5e60ce, 
          border: `1px solid ${APP_COLORS.rgba_94_96_206_0p3_2}` 
        }}>
          {v || 'unknown'}
        </Tag>
      ),
    },
    {
      title: 'Query Count',
      dataIndex: 'query_count',
      key: 'query_count',
      render: (v: number) => formatNumber(v),
      sorter: (a: DatabaseMetric, b: DatabaseMetric) => a.query_count - b.query_count,
      align: 'right' as const,
    },
    {
      title: 'Avg Latency',
      dataIndex: 'avg_latency_ms',
      key: 'avg_latency_ms',
      render: (v: number) => formatDuration(v),
      sorter: (a: DatabaseMetric, b: DatabaseMetric) => a.avg_latency_ms - b.avg_latency_ms,
      align: 'right' as const,
    },
  ];

  if (loading) return <Skeleton active paragraph={{ rows: 8 }} />;
  if (data.length === 0) return <Empty description="No saturation data in selected time range" />;

  return (
    <Table
      dataSource={data.map((m, i) => ({ ...m, key: i }))}
      columns={columns}
      size="small"
      pagination={{ pageSize: 20 }}
      scroll={{ x: 800 }}
    />
  );
};
