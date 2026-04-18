import { SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import type { EndpointMetricPoint } from "@/features/metrics/types";

import { useTopEndpoints } from "./useTopEndpoints";

interface TopEndpointsTableProps {
  readonly serviceName: string;
}

function endpointErrorRate(row: EndpointMetricPoint): number {
  const requests = Number(row.request_count ?? 0);
  if (requests <= 0) return 0;
  return (Number(row.error_count ?? 0) * 100) / requests;
}

const COLUMNS: SimpleTableColumn<EndpointMetricPoint>[] = [
  {
    title: "Endpoint",
    key: "operation_name",
    render: (_value, row) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-[var(--text-primary)]">
          {row.endpoint_name || row.operation_name}
        </span>
        <span className="text-[11px] text-[var(--text-muted)]">
          {row.http_method || "span"} · {row.operation_name}
        </span>
      </div>
    ),
  },
  {
    title: "Requests",
    key: "request_count",
    align: "right",
    width: 110,
    render: (_value, row) => formatNumber(row.request_count),
  },
  {
    title: "Error %",
    key: "error_rate",
    align: "right",
    width: 100,
    render: (_value, row) => formatPercentage(endpointErrorRate(row)),
  },
  {
    title: "p95",
    key: "p95_latency",
    align: "right",
    width: 100,
    render: (_value, row) => formatDuration(row.p95_latency),
  },
];

export default function TopEndpointsTable({ serviceName }: TopEndpointsTableProps) {
  const { endpoints, loading } = useTopEndpoints(serviceName);

  if (loading && endpoints.length === 0) {
    return <div className="text-[12px] text-[var(--text-muted)]">Loading endpoints…</div>;
  }

  if (endpoints.length === 0) {
    return <div className="text-[12px] text-[var(--text-muted)]">No endpoint traffic yet.</div>;
  }

  return (
    <SimpleTable
      columns={COLUMNS}
      dataSource={[...endpoints]}
      pagination={false}
      size="middle"
      rowKey={(row) => `${row.http_method ?? ""}:${row.operation_name}:${row.endpoint_name ?? ""}`}
    />
  );
}
