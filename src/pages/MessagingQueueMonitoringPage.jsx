import { Row, Col, Card, Spin } from 'antd';
import { useMemo } from 'react';
import { Network, Activity, AlertTriangle, ArrowUpRight, ArrowDownRight, Layers, Clock } from 'lucide-react';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { PageHeader, StatCard } from '@components/common';
import { v1Service } from '@services/v1Service';
import RequestChart from '@components/charts/RequestChart';

const n = (v) => (v == null || Number.isNaN(Number(v)) ? 0 : Number(v));



export default function MessagingQueueMonitoringPage() {
  const { data, isLoading } = useTimeRangeQuery(
    'messaging-queue-insights',
    (teamId, start, end) => v1Service.getMessagingQueueInsights(teamId, start, end, '5m')
  );

  const summary = data?.summary || {};
  const ts = Array.isArray(data?.timeseries) ? data.timeseries : [];

  const serviceTimeseriesMap = useMemo(() => {
    const map = {};
    for (const row of ts) {
      const q = row.queue_name || 'unknown';
      if (!map[q]) map[q] = [];
      map[q].push(row);
    }
    return map;
  }, [ts]);

  const uniqueQueues = Object.keys(serviceTimeseriesMap);

  return (
    <div>
      <PageHeader
        title="Messaging / Queue Monitoring"
        icon={<Network size={24} />}
        subtitle="Throughput rates, consumer lag, queue depth, and processing errors per queue"
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Avg Queue Depth" value={n(summary.avg_queue_depth).toFixed(1)} icon={<Layers size={18} />} loading={isLoading} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Max Consumer Lag" value={n(summary.max_consumer_lag).toFixed(1)} icon={<Clock size={18} />} loading={isLoading} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Avg Processing Errors" value={n(summary.processing_errors).toFixed(0)} icon={<AlertTriangle size={18} />} loading={isLoading} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Total Queues" value={uniqueQueues.length} icon={<Network size={18} />} loading={isLoading} />
        </Col>
      </Row>

      <Spin spinning={isLoading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title={<span><ArrowUpRight size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Production Rate (msg/s)</span>} className="chart-card" styles={{ body: { padding: '8px' } }}>
              <div style={{ height: 280 }}>
                <RequestChart serviceTimeseriesMap={serviceTimeseriesMap} valueKey="avg_publish_rate" />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={<span><ArrowDownRight size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Consumption Rate (msg/s)</span>} className="chart-card" styles={{ body: { padding: '8px' } }}>
              <div style={{ height: 280 }}>
                <RequestChart serviceTimeseriesMap={serviceTimeseriesMap} valueKey="avg_receive_rate" />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={<span><Clock size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Consumer Group Lag</span>} className="chart-card" styles={{ body: { padding: '8px' } }}>
              <div style={{ height: 280 }}>
                <RequestChart serviceTimeseriesMap={serviceTimeseriesMap} valueKey="avg_consumer_lag" />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={<span><Layers size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Topic Lag (Queue Depth)</span>} className="chart-card" styles={{ body: { padding: '8px' } }}>
              <div style={{ height: 280 }}>
                <RequestChart serviceTimeseriesMap={serviceTimeseriesMap} valueKey="avg_queue_depth" />
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}
