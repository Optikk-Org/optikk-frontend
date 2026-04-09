import { useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { Activity, Gauge, Layers3, TimerReset, Waves } from "lucide-react";

import {
  Badge,
  Button,
  SimpleTable,
  type SimpleTableColumn,
} from "@shared/components/primitives/ui";
import { PageHeader, PageShell, PageSurface } from "@shared/components/ui";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import { ROUTES } from "@/shared/constants/routes";
import { type KafkaGroupRow, type KafkaPartitionRow, saturationApi } from "../../api/saturationApi";
import { SaturationStatTile } from "../../components/SaturationStatTile";
import {
  buildSaturationLogsSearch,
  buildSaturationTracesSearch,
} from "../../components/navigation";

export default function KafkaTopicDetailPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams({ strict: false });
  const topic = decodeURIComponent(typeof params.topic === "string" ? params.topic : "");

  const overviewQuery = useTimeRangeQuery(
    "saturation-kafka-topic-overview",
    (teamId, startTime, endTime) =>
      saturationApi.getKafkaTopicOverview(topic, teamId, startTime, endTime),
    { extraKeys: [topic] }
  );
  const groupsQuery = useTimeRangeQuery(
    "saturation-kafka-topic-groups",
    (teamId, startTime, endTime) =>
      saturationApi.getKafkaTopicGroups(topic, teamId, startTime, endTime),
    { extraKeys: [topic] }
  );
  const partitionsQuery = useTimeRangeQuery(
    "saturation-kafka-topic-partitions",
    (teamId, startTime, endTime) =>
      saturationApi.getKafkaTopicPartitions(topic, teamId, startTime, endTime),
    { extraKeys: [topic] }
  );

  const openSurface = (target: "logs" | "traces") => {
    const filters = [{ field: "messaging.destination.name", operator: "equals", value: topic }];
    navigate({
      to: target === "logs" ? ROUTES.logs : ROUTES.traces,
      search:
        target === "logs"
          ? (buildSaturationLogsSearch(location.search, filters as any) as any)
          : (buildSaturationTracesSearch(location.search, filters as any) as any),
    });
  };

  const groupColumns: SimpleTableColumn<KafkaGroupRow>[] = [
    {
      title: "Consumer Group",
      key: "consumer_group",
      width: 300,
      render: (_value, row) => (
        <span className="font-medium text-[var(--text-primary)]">{row.consumer_group}</span>
      ),
    },
    {
      title: "Lag",
      key: "lag",
      align: "right",
      width: 100,
      render: (_value, row) => formatNumber(row.lag),
    },
    {
      title: "Consume/s",
      key: "consume_rate_per_sec",
      align: "right",
      width: 110,
      render: (_value, row) => formatNumber(row.consume_rate_per_sec),
    },
    {
      title: "Process p95",
      key: "process_p95_ms",
      align: "right",
      width: 110,
      render: (_value, row) => formatDuration(row.process_p95_ms),
    },
    {
      title: "Err Rate",
      key: "error_rate",
      align: "right",
      width: 110,
      render: (_value, row) => formatPercentage(row.error_rate),
    },
  ];

  const partitionColumns: SimpleTableColumn<KafkaPartitionRow>[] = [
    {
      title: "Partition",
      key: "partition",
      align: "right",
      width: 100,
      render: (_value, row) => formatNumber(row.partition),
    },
    {
      title: "Group",
      key: "consumer_group",
      width: 260,
      render: (_value, row) => row.consumer_group || "—",
    },
    {
      title: "Lag",
      key: "lag",
      align: "right",
      width: 100,
      render: (_value, row) => formatNumber(row.lag),
    },
  ];

  const overview = overviewQuery.data?.summary;

  return (
    <PageShell>
      <PageHeader
        title={topic}
        subtitle="Topic-level backlog, latency, and downstream consumer pressure."
        icon={<Waves size={24} />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">Kafka topic</Badge>
            <Button size="sm" variant="secondary" onClick={() => openSurface("logs")}>
              Logs
            </Button>
            <Button size="sm" variant="secondary" onClick={() => openSurface("traces")}>
              Traces
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <SaturationStatTile
          label="Produce/s"
          value={formatNumber(overview?.produce_rate_per_sec ?? 0)}
          meta="Producer throughput"
          icon={<Activity size={16} />}
        />
        <SaturationStatTile
          label="Consume/s"
          value={formatNumber(overview?.consume_rate_per_sec ?? 0)}
          meta="Consumer receive rate"
          icon={<Activity size={16} />}
        />
        <SaturationStatTile
          label="Max Lag"
          value={formatNumber(overview?.max_lag ?? 0)}
          meta="Largest observed lag in range"
          icon={<Gauge size={16} />}
        />
        <SaturationStatTile
          label="E2E p95"
          value={formatDuration(overview?.e2e_p95_ms ?? 0)}
          meta="End-to-end processing latency"
          icon={<TimerReset size={16} />}
        />
        <SaturationStatTile
          label="Err Rate"
          value={formatPercentage(overview?.error_rate ?? 0)}
          meta="Worst bucket across producer/consumer errors"
          icon={<TimerReset size={16} />}
        />
        <SaturationStatTile
          label="Groups"
          value={formatNumber(overview?.consumer_group_count ?? 0)}
          meta="Consumer groups attached to this topic"
          icon={<Layers3 size={16} />}
        />
      </div>

      <PageSurface padding="lg">
        <div className="mb-3">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Consumers
          </div>
          <div className="mt-2 font-semibold text-[18px] text-[var(--text-primary)]">
            Groups consuming this topic
          </div>
        </div>
        <SimpleTable
          dataSource={groupsQuery.data ?? []}
          columns={groupColumns}
          rowKey={(row) => row.consumer_group}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 860 }}
        />
      </PageSurface>

      <PageSurface padding="lg">
        <div className="mb-3">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Partitions
          </div>
          <div className="mt-2 font-semibold text-[18px] text-[var(--text-primary)]">
            Partition hotspots
          </div>
        </div>
        <SimpleTable
          dataSource={partitionsQuery.data ?? []}
          columns={partitionColumns}
          rowKey={(row, index) => `${row.partition}-${row.consumer_group}-${index}`}
          pagination={{ pageSize: 12 }}
          scroll={{ x: 620 }}
        />
      </PageSurface>
    </PageShell>
  );
}
