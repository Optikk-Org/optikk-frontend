import { Tag, Table, Skeleton, Empty } from 'antd';
import React from 'react';
import { APP_COLORS } from '@config/colorLiterals';
import { formatNumber } from '@shared/utils/formatters';

interface KafkaMetric {
  queue: string;
  avg_consumer_lag: number;
  avg_queue_depth: number;
  [key: string]: unknown;
}

interface KafkaSaturationTableProps {
  data: KafkaMetric[];
  loading: boolean;
}

export const KafkaSaturationTable: React.FC<KafkaSaturationTableProps> = ({ data, loading }) => {
  const columns = [
    {
      title: 'Kafka Queue',
      dataIndex: 'queue',
      key: 'queue',
      render: (v: string) => (
        <Tag style={{ 
          background: APP_COLORS.rgba_247_144_9_0p15, 
          color: APP_COLORS.hex_f79009, 
          border: `1px solid ${APP_COLORS.rgba_247_144_9_0p3_2}` 
        }}>
          {v || 'unknown'}
        </Tag>
      ),
    },
    {
      title: 'Consumer Lag (Avg)',
      dataIndex: 'avg_consumer_lag',
      key: 'avg_consumer_lag',
      render: (v: number) => formatNumber(v),
      sorter: (a: KafkaMetric, b: KafkaMetric) => a.avg_consumer_lag - b.avg_consumer_lag,
      align: 'right' as const,
    },
    {
      title: 'Queue Depth (Avg)',
      dataIndex: 'avg_queue_depth',
      key: 'avg_queue_depth',
      render: (v: number) => formatNumber(v),
      sorter: (a: KafkaMetric, b: KafkaMetric) => a.avg_queue_depth - b.avg_queue_depth,
      align: 'right' as const,
    },
  ];

  if (loading) return <Skeleton active paragraph={{ rows: 8 }} />;
  if (data.length === 0) return <Empty description="No messaging data in selected time range" />;

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
