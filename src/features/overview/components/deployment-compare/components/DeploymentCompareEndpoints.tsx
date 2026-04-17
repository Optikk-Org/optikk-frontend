import { GitCompare } from "lucide-react";
import { memo, useMemo } from "react";

import type { DeploymentCompareResponse } from "@/features/overview/api/deploymentsApi";
import {
  Card,
  SimpleTable,
  type SimpleTableColumn,
} from "@shared/components/primitives/ui";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import { DeltaPill } from "./DeltaPill";

type EndpointRow = DeploymentCompareResponse["top_endpoints"][number];

interface Props {
  compare: DeploymentCompareResponse;
}

function DeploymentCompareEndpointsComponent({ compare }: Props) {
  const columns = useMemo<SimpleTableColumn<EndpointRow>[]>(
    () => [
      {
        title: "Endpoint",
        key: "endpoint",
        width: 320,
        render: (_value, row) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-[var(--text-primary)]">
              {row.endpoint_name || row.operation_name}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              {row.http_method || "—"} • span {row.operation_name}
            </span>
          </div>
        ),
      },
      {
        title: "p95 Δ",
        key: "p95_delta_ms",
        align: "right",
        width: 120,
        render: (_value, row) => <DeltaPill delta={row.p95_delta_ms} formatter={formatDuration} />,
      },
      {
        title: "Err Δ",
        key: "error_rate_delta",
        align: "right",
        width: 120,
        render: (_value, row) => (
          <DeltaPill delta={row.error_rate_delta} formatter={formatPercentage} />
        ),
      },
      {
        title: "Requests",
        key: "requests",
        align: "right",
        width: 110,
        render: (_value, row) => formatNumber(row.after_requests),
      },
      {
        title: "Score",
        key: "regression_score",
        align: "right",
        width: 110,
        render: (_value, row) => row.regression_score.toFixed(1),
      },
    ],
    []
  );

  return (
    <Card padding="lg" className="border-[rgba(255,255,255,0.07)]">
      <div className="mb-4 flex items-center gap-2">
        <GitCompare size={16} className="text-[var(--color-primary)]" />
        <h3 className="font-semibold text-[var(--text-primary)]">Endpoint regressions</h3>
      </div>
      {compare.top_endpoints.length === 0 ? (
        <div className="text-[12px] text-[var(--text-muted)]">
          No endpoint regression candidates were found for this release.
        </div>
      ) : (
        <SimpleTable
          columns={columns}
          dataSource={compare.top_endpoints}
          pagination={false}
          size="middle"
          rowKey={(row) => `${row.http_method}:${row.endpoint_name}:${row.operation_name}`}
        />
      )}
    </Card>
  );
}

export const DeploymentCompareEndpoints = memo(DeploymentCompareEndpointsComponent);
