import { useNavigate } from "@tanstack/react-router";

import { SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";
import { ROUTES } from "@/shared/constants/routes";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import type { DependencyRow } from "./useServiceDependencies";

interface DependencyTableProps {
  readonly rows: readonly DependencyRow[];
  readonly emptyMessage: string;
  readonly loading: boolean;
}

const COLUMNS: SimpleTableColumn<DependencyRow>[] = [
  {
    title: "Service",
    key: "peerService",
    render: (_value, row) => (
      <span className="font-medium text-[var(--text-primary)]">{row.peerService}</span>
    ),
  },
  {
    title: "Calls",
    key: "callCount",
    align: "right",
    width: 100,
    render: (_value, row) => formatNumber(row.callCount),
  },
  {
    title: "Error %",
    key: "errorRate",
    align: "right",
    width: 100,
    render: (_value, row) => formatPercentage(row.errorRate),
  },
  {
    title: "p95",
    key: "p95",
    align: "right",
    width: 100,
    render: (_value, row) => formatDuration(row.p95),
  },
];

export default function DependencyTable({ rows, emptyMessage, loading }: DependencyTableProps) {
  const navigate = useNavigate();

  if (loading && rows.length === 0) {
    return <div className="text-[12px] text-[var(--text-muted)]">Loading dependencies…</div>;
  }

  if (rows.length === 0) {
    return <div className="text-[12px] text-[var(--text-muted)]">{emptyMessage}</div>;
  }

  const handleRow = (row: DependencyRow) => ({
    onClick: () =>
      navigate(
        dynamicNavigateOptions(
          ROUTES.serviceDetail.replace("$serviceName", encodeURIComponent(row.peerService))
        )
      ),
    style: { cursor: "pointer" } as const,
  });

  return (
    <SimpleTable
      columns={COLUMNS}
      dataSource={[...rows]}
      pagination={false}
      size="middle"
      rowKey={(row) => row.peerService}
      onRow={handleRow}
    />
  );
}
