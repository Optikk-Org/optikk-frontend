import { Row, Col, Card, Spin } from 'antd';
import { useMemo, useState } from 'react';
import { Network, Activity, AlertTriangle, ArrowUpRight, ArrowDownRight, Layers, Clock } from 'lucide-react';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { PageHeader, StatCard, QueueMetricsList } from '@components/common';
import { v1Service } from '@services/v1Service';
import RequestChart from '@components/charts/RequestChart';

const n = (v) => (v == null || Number.isNaN(Number(v)) ? 0 : Number(v));
const queueSeriesKey = (row) => `${row?.queue_name || 'unknown'}::${row?.service_name || 'unknown'}`;
const scopeQueues = (scope, queues) =>
  queues.map((q) => ({ ...q, seriesKey: q.key, key: `${scope}::${q.key}` }));

function QueueChartCard({ title, valueKey, listType, listTitle, queues, serviceTimeseriesMap }) {
  const [selectedQueues, setSelectedQueues] = useState([]);
  const toggleQueue = (qKey) => {
    setSelectedQueues((prev) =>
      prev.includes(qKey) ? prev.filter((k) => k !== qKey) : [...prev, qKey]
    );
  };

  return (
    <Card title={title} className="chart-card" styles={{ body: { padding: '8px' } }}>
      <div style={{ height: 280 }}>
        <RequestChart
          serviceTimeseriesMap={serviceTimeseriesMap}
          valueKey={valueKey}
          selectedEndpoints={selectedQueues}
          endpoints={queues}
        />
      </div>
      <QueueMetricsList
        type={listType}
        title={listTitle}
        queues={queues}
        selectedQueues={selectedQueues}
        onToggle={toggleQueue}
      />
    </Card>
  );
}

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
      const key = queueSeriesKey(row);
      if (!map[key]) map[key] = [];
      map[key].push(row);
    }
    return map;
  }, [ts]);

  const uniqueQueues = Object.keys(serviceTimeseriesMap);

  const topQueuesBase = useMemo(() => {
    return Array.isArray(data?.topQueues)
      ? data.topQueues.map(q => ({ ...q, key: queueSeriesKey(q) }))
      : [];
  }, [data?.topQueues]);

  const topQueuesSortedByDepth = useMemo(() => {
    return scopeQueues('depth', [...topQueuesBase].sort((a, b) => b.avg_queue_depth - a.avg_queue_depth));
  }, [topQueuesBase]);

  const topQueuesSortedByLag = useMemo(() => {
    return scopeQueues('lag', [...topQueuesBase].sort((a, b) => b.max_consumer_lag - a.max_consumer_lag));
  }, [topQueuesBase]);

  const topQueuesSortedByPublish = useMemo(() => {
    return scopeQueues('publish', [...topQueuesBase].sort((a, b) => b.avg_publish_rate - a.avg_publish_rate));
  }, [topQueuesBase]);

  const topQueuesSortedByReceive = useMemo(() => {
    return scopeQueues('receive', [...topQueuesBase].sort((a, b) => b.avg_receive_rate - a.avg_receive_rate));
  }, [topQueuesBase]);

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
            <QueueChartCard
              title={<span><ArrowUpRight size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Production Rate (msg/s)</span>}
              valueKey="avg_publish_rate"
              listType="productionRate"
              listTitle="Production Rate"
              queues={topQueuesSortedByPublish}
              serviceTimeseriesMap={serviceTimeseriesMap}
            />
          </Col>
          <Col xs={24} lg={12}>
            <QueueChartCard
              title={<span><ArrowDownRight size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Consumption Rate (msg/s)</span>}
              valueKey="avg_receive_rate"
              listType="consumptionRate"
              listTitle="Consumption Rate"
              queues={topQueuesSortedByReceive}
              serviceTimeseriesMap={serviceTimeseriesMap}
            />
          </Col>
          <Col xs={24} lg={12}>
            <QueueChartCard
              title={<span><Clock size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Consumer Group Lag</span>}
              valueKey="avg_consumer_lag"
              listType="consumerLag"
              listTitle="Max Lag"
              queues={topQueuesSortedByLag}
              serviceTimeseriesMap={serviceTimeseriesMap}
            />
          </Col>
          <Col xs={24} lg={12}>
            <QueueChartCard
              title={<span><Layers size={16} style={{ marginRight: 8, verticalAlign: 'text-bottom' }} />Topic Lag (Queue Depth)</span>}
              valueKey="avg_queue_depth"
              listType="depth"
              listTitle="Avg Depth"
              queues={topQueuesSortedByDepth}
              serviceTimeseriesMap={serviceTimeseriesMap}
            />
          </Col>
        </Row>
      </Spin>
    </div>
  );
}
