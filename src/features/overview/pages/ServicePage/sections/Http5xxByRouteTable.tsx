import { SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";
import { formatNumber } from "@shared/utils/formatters";

import type { Http5xxRoutePoint } from "@/features/overview/api/serviceDetailApi";

import { useHttp5xxByRoute } from "./useHttp5xxByRoute";

interface Http5xxByRouteTableProps {
  readonly serviceName: string;
}

const COLUMNS: SimpleTableColumn<Http5xxRoutePoint>[] = [
  {
    title: "Route",
    key: "http_route",
    render: (_value, row) => (
      <span className="font-medium text-[var(--text-primary)]">{row.http_route || "—"}</span>
    ),
  },
  {
    title: "5xx count",
    key: "count",
    align: "right",
    width: 120,
    render: (_value, row) => formatNumber(row.count ?? 0),
  },
  {
    title: "Rate",
    key: "rate",
    align: "right",
    width: 120,
    render: (_value, row) => `${(row.rate ?? 0).toFixed(2)}/min`,
  },
];

export default function Http5xxByRouteTable({ serviceName }: Http5xxByRouteTableProps) {
  const { routes, loading } = useHttp5xxByRoute(serviceName);

  if (loading && routes.length === 0) {
    return (
      <div className="text-[12px] text-[var(--text-muted)]">Loading HTTP 5xx breakdown…</div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="text-[12px] text-[var(--text-muted)]">No 5xx errors in this window.</div>
    );
  }

  return (
    <SimpleTable
      columns={COLUMNS}
      dataSource={[...routes]}
      pagination={false}
      size="middle"
      rowKey={(row) => `${row.http_route ?? ""}:${row.count ?? 0}`}
    />
  );
}
