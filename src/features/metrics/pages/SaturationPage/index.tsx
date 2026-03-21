import { Surface } from '@/components/ui';
import {
  Gauge, Database, Radio, Cpu, GitPullRequest,
} from 'lucide-react';
import { useMemo } from 'react';

import StatCard from '@shared/components/ui/cards/StatCard';
import PageHeader from '@shared/components/ui/layout/PageHeader';
import ConfigurableDashboard from '@shared/components/ui/dashboard/ConfigurableDashboard';

import { saturationService } from '@shared/api/saturationService';

import { useDashboardConfig } from '@shared/hooks/useDashboardConfig';
import { useTimeRangeQuery } from '@shared/hooks/useTimeRangeQuery';

import { formatNumber } from '@shared/utils/formatters';

import { APP_COLORS } from '@config/colorLiterals';
import { KafkaSaturationTable } from '../../components/KafkaSaturationTable';

function normalizeKafkaMetric(row: any = {}) {
  return {
    ...row,
    queue: row.queue ?? row.topic ?? '',
    avg_consumer_lag: Number(row.avg_consumer_lag ?? 0),
    max_consumer_lag: Number(row.max_consumer_lag ?? 0),
    avg_queue_depth: Number(row.avg_queue_depth ?? 0),
    max_queue_depth: Number(row.max_queue_depth ?? 0),
    avg_publish_rate: Number(row.avg_publish_rate ?? 0),
    avg_receive_rate: Number(row.avg_receive_rate ?? 0),
  };
}

export default function SaturationPage() {
  const { config } = useDashboardConfig('saturation');

  const { data: kafkaLagRaw, isLoading: lagLoading } = useTimeRangeQuery(
    'saturation-kafka-lag',
    (teamId, start, end) => saturationService.getConsumerLagByGroup(teamId, start, end),
  );


  const kafkaLag = useMemo(() => {
    const raw = Array.isArray(kafkaLagRaw) ? kafkaLagRaw : [];
    return raw.map(normalizeKafkaMetric);
  }, [kafkaLagRaw]);



  const summary = useMemo(() => {
    const maxLag = kafkaLag.length ? Math.max(...kafkaLag.map((m) => Number(m.max_consumer_lag) || 0)) : 0;
    const maxQueue = kafkaLag.length ? Math.max(...kafkaLag.map((m) => Number(m.max_queue_depth) || 0)) : 0;

    return { maxLag, maxQueue, maxDbPool: 0, maxThread: 0 };
  }, [kafkaLag]);

  return (
    <div className="p-0">
      <PageHeader
        title="Saturation Metrics"
        subtitle="Leading indicators: queue depths, consumer lag, thread pools, and connection pool utilization"
        icon={<Gauge size={24} />}
      />

      {/* Summary stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard
          metric={{
            title: 'Max DB Pool Util',
            value: `${Number(summary.maxDbPool).toFixed(1)}%`,
          }}
          visuals={{
            icon: <Database size={20} />,
            iconColor: summary.maxDbPool > 80 ? APP_COLORS.hex_f04438 : summary.maxDbPool > 60 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_73c991,
          }}
        />
        <StatCard
          metric={{
            title: 'Max Consumer Lag',
            value: formatNumber(summary.maxLag),
          }}
          visuals={{
            icon: <Radio size={20} />,
            iconColor: summary.maxLag > 1000 ? APP_COLORS.hex_f04438 : summary.maxLag > 100 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_73c991,
          }}
        />
        <StatCard
          metric={{
            title: 'Max Thread Active',
            value: formatNumber(summary.maxThread),
          }}
          visuals={{
            icon: <Cpu size={20} />,
            iconColor: summary.maxThread > 200 ? APP_COLORS.hex_f04438 : summary.maxThread > 100 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_73c991,
          }}
        />
        <StatCard
          metric={{
            title: 'Max Queue Depth',
            value: formatNumber(summary.maxQueue),
          }}
          visuals={{
            icon: <GitPullRequest size={20} />,
            iconColor: summary.maxQueue > 1000 ? APP_COLORS.hex_f04438 : summary.maxQueue > 100 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_73c991,
          }}
        />
      </div>

      {/* Configurable timeseries charts */}
      <div style={{ marginBottom: 24 }}>
        <ConfigurableDashboard
          config={config}
          dataSources={{
            'saturation-kafka-lag': kafkaLag,
          }}
          isLoading={lagLoading}
        />
      </div>



      {/* Kafka saturation table */}
      <div style={{ marginTop: 16 }}>
        <Surface elevation={1} padding="md" className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg h-full">
          <h4>Kafka Queue / Consumer Lag</h4>
          <KafkaSaturationTable data={kafkaLag} loading={lagLoading} />
        </Surface>
      </div>

      {/* Instrumentation guide */}
      <div style={{ marginTop: 16 }}>
        <Surface elevation={1} padding="md" className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg h-full">
          <h4>Instrumentation Guide</h4>
          <div className="flex flex-col gap-4">
            <div className="text-[13px] text-[var(--text-muted)] leading-relaxed">
              Saturation metrics are extracted from OpenTelemetry span <strong className="text-[var(--text-primary)]">attributes</strong>.
              Add these attributes to your spans to populate the charts above:
            </div>
            <div className="flex flex-col border border-[var(--border-color)] rounded-md overflow-hidden">
              {[
                { icon: <Database size={16} />, attr: 'db.connection_pool.utilization', desc: 'DB connection pool utilization (0–100)', example: '72.5', color: APP_COLORS.hex_06aed5 },
                { icon: <Radio size={16} />, attr: 'messaging.kafka.consumer.lag', desc: 'Kafka consumer group lag (message count)', example: '3204', color: APP_COLORS.hex_f79009 },
                { icon: <Cpu size={16} />, attr: 'thread.pool.active', desc: 'Number of active threads in the pool', example: '42', color: APP_COLORS.hex_5e60ce },
                { icon: <Cpu size={16} />, attr: 'thread.pool.size', desc: 'Maximum thread pool capacity', example: '100', color: APP_COLORS.hex_5e60ce },
                { icon: <GitPullRequest size={16} />, attr: 'queue.depth', desc: 'Internal queue depth / pending item count', example: '847', color: APP_COLORS.hex_e478fa },
              ].map((item, i, arr) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-[var(--bg-tertiary)]${i < arr.length - 1 ? ' border-b border-[var(--border-color)]' : ''}`}
                >
                  <div className="shrink-0 w-6 flex items-center justify-center" style={{ color: item.color }}>{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <code className="font-mono text-[12px] text-[var(--text-primary)] bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded inline-block">{item.attr}</code>
                    <div className="text-[11px] text-[var(--text-muted)] mt-1">{item.desc}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-[var(--text-muted)] text-[11px]">e.g. </span>
                    <code className="text-[11px]" style={{ color: item.color }}>{item.example}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Surface>
      </div>
    </div>
  );
}
