import { AlertTriangle } from "lucide-react";
import { memo } from "react";

import type { DeploymentCompareResponse } from "@/features/overview/api/deploymentsApi";
import { Badge, Card } from "@shared/components/primitives/ui";
import { formatNumber } from "@shared/utils/formatters";

import { DeltaPill } from "./DeltaPill";

interface Props {
  compare: DeploymentCompareResponse;
}

function DeploymentCompareErrorsComponent({ compare }: Props) {
  return (
    <Card padding="lg" className="border-[rgba(255,255,255,0.07)]">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle size={16} className="text-[var(--color-warning)]" />
        <h3 className="font-semibold text-[var(--text-primary)]">Top error regressions</h3>
      </div>
      {compare.top_errors.length === 0 ? (
        <div className="text-[12px] text-[var(--text-muted)]">
          {compare.has_baseline
            ? "No notable error regressions were found for this release."
            : "A previous deployment baseline is required to rank error regressions."}
        </div>
      ) : (
        <div className="space-y-3">
          {compare.top_errors.map((errorRow) => (
            <div
              key={errorRow.group_id}
              className="rounded-[var(--card-radius)] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    errorRow.severity === "critical"
                      ? "error"
                      : errorRow.severity === "warning"
                        ? "warning"
                        : "default"
                  }
                >
                  {errorRow.http_status_code || "error"}
                </Badge>
                <DeltaPill delta={errorRow.delta_count} formatter={formatNumber} />
              </div>
              <div className="mt-2 font-medium text-[var(--text-primary)]">
                {errorRow.status_message || errorRow.operation_name || "Unhandled error"}
              </div>
              <div className="mt-1 text-[12px] text-[var(--text-secondary)]">
                {errorRow.operation_name} • before {formatNumber(errorRow.before_count)} • after{" "}
                {formatNumber(errorRow.after_count)}
              </div>
              {errorRow.sample_trace_id ? (
                <div className="mt-1 text-[11px] text-[var(--text-muted)]">
                  sample trace {errorRow.sample_trace_id.slice(0, 12)}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export const DeploymentCompareErrors = memo(DeploymentCompareErrorsComponent);
