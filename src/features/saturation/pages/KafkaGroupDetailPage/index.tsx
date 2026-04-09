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
import { type KafkaPartitionRow, type KafkaTopicRow, saturationApi } from "../../api/saturationApi";
import { SaturationStatTile } from "../../components/SaturationStatTile";
import {
  buildSaturationLogsSearch,
  buildSaturationTracesSearch,
} from "../../components/navigation";

export default function KafkaGroupDetailPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams({ strict: false });
  const groupId = decodeURIComponent(typeof params.groupId === "string" ? params.groupId : "");

  const overviewQuery = useTimeRangeQuery(
    "saturation-kafka-group-overview",
    (teamId, startTime, endTime) =>
      saturationApi.getKafkaGroupOverview(groupId, teamId, startTime, endTime),
    { extraKeys: [groupId] }
  );
  const topicsQuery = useTimeRangeQuery(
    "saturation-kafka-group-topics",
    (teamId, startTime, endTime) =>
      saturationApi.getKafkaGroupTopics(groupId, teamId, startTime, endTime),
    { extraKeys: [groupId] }
  );
  const partitionsQuery = useTimeRangeQuery(
    "saturation-kafka-group-partitions",
    (teamId, startTime, endTime) =>
      saturationApi.getKafkaGroupPartitions(groupId, teamId, startTime, endTime),
    { extraKeys: [groupId] }
  );

  const openSurface = (target: "logs" | "traces") => {
    const filters = [
      { field: "messaging.consumer.group.name", operator: "equals", value: groupId },
    ];
    navigate({
      to: target === "logs" ? ROUTES.logs : ROUTES.traces,
      search:
        target === "logs"
          ? (buildSaturationLogsSearch(location.search, filters as any) as any)
          : (buildSaturationTracesSearch(location.search, filters as any) as any),
    });
  };

  const topicColumns: SimpleTableColumn<KafkaTopicRow>[] = [
    {
      title: "Topic",
      key: "topic",
      width: 300,
      render: (_value, row) => (
        <span className="font-medium text-[var(--text-primary)]">{row.topic}</span>
      ),
    },
    {
      title: "Consume/s",
      key: "consume_rate_per_sec",
      align: "right",
      width: 110,
      render: (_value, row) => formatNumber(row.consume_rate_per_sec),
    },
    {
      title: "Lag",
      key: "max_lag",
      align: "right",
      width: 110,
      render: (_value, row) => formatNumber(row.max_lag),
    },
    {
      title: "Receive p95",
      key: "receive_p95_ms",
      align: "right",
      width: 110,
      render: (_value, row) => formatDuration(row.receive_p95_ms),
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
    { title: "Topic", key: "topic", width: 280, render: (_value, row) => row.topic || "—" },
    {
      title: "Partition",
      key: "partition",
      align: "right",
      width: 100,
      render: (_value, row) => formatNumber(row.partition),
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
        title={groupId}
        subtitle="Consumer-group detail with lag, topic fan-out, partition hotspots, and rebalance pressure."
        icon={<Layers3 size={24} />}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="warning">Consumer group</Badge>
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
          label="Lag"
          value={formatNumber(overview?.lag ?? 0)}
          meta="Largest observed lag in range"
          icon={<Gauge size={16} />}
        />
        <SaturationStatTile
          label="Consume/s"
          value={formatNumber(overview?.consume_rate_per_sec ?? 0)}
          meta="Messages received by the group"
          icon={<Activity size={16} />}
        />
        <SaturationStatTile
          label="Process/s"
          value={formatNumber(overview?.process_rate_per_sec ?? 0)}
          meta="Messages successfully processed"
          icon={<Activity size={16} />}
        />
        <SaturationStatTile
          label="Process p95"
          value={formatDuration(overview?.process_p95_ms ?? 0)}
          meta="Processing latency"
          icon={<TimerReset size={16} />}
        />
        <SaturationStatTile
          label="Rebalance"
          value={formatNumber(overview?.rebalance_rate ?? 0)}
          meta={`${formatNumber(overview?.assigned_partitions ?? 0)} assigned partitions`}
          icon={<Waves size={16} />}
        />
        <SaturationStatTile
          label="Topics"
          value={formatNumber(overview?.topic_count ?? 0)}
          meta={`${formatPercentage(overview?.error_rate ?? 0)} worst error rate`}
          icon={<Layers3 size={16} />}
        />
      </div>

      <PageSurface padding="lg">
        <div className="mb-3">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Topics
          </div>
          <div className="mt-2 font-semibold text-[18px] text-[var(--text-primary)]">
            Topics handled by this group
          </div>
        </div>
        <SimpleTable
          dataSource={topicsQuery.data ?? []}
          columns={topicColumns}
          rowKey={(row) => row.topic}
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
            Lag hotspots by partition
          </div>
        </div>
        <SimpleTable
          dataSource={partitionsQuery.data ?? []}
          columns={partitionColumns}
          rowKey={(row, index) => `${row.topic}-${row.partition}-${index}`}
          pagination={{ pageSize: 12 }}
          scroll={{ x: 560 }}
        />
      </PageSurface>
    </PageShell>
  );
}
