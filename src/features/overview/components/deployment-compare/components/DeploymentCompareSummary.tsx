import { memo } from "react";

import type { DeploymentCompareResponse } from "@/features/overview/api/deploymentsApi";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import { SummaryCard } from "./SummaryCard";

interface Props {
  compare: DeploymentCompareResponse;
}

function DeploymentCompareSummaryComponent({ compare }: Props) {
  const before = compare.summary.before;
  const after = compare.summary.after;

  return (
    <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        label="Requests"
        beforeValue={before?.request_count}
        afterValue={after.request_count}
        delta={after.request_count - (before?.request_count ?? 0)}
        formatter={formatNumber}
      />
      <SummaryCard
        label="Errors"
        beforeValue={before?.error_count}
        afterValue={after.error_count}
        delta={after.error_count - (before?.error_count ?? 0)}
        formatter={formatNumber}
      />
      <SummaryCard
        label="Error Rate"
        beforeValue={before?.error_rate}
        afterValue={after.error_rate}
        delta={after.error_rate - (before?.error_rate ?? 0)}
        formatter={formatPercentage}
        invertDelta
      />
      <SummaryCard
        label="P95"
        beforeValue={before?.p95_ms}
        afterValue={after.p95_ms}
        delta={after.p95_ms - (before?.p95_ms ?? 0)}
        formatter={formatDuration}
        invertDelta
      />
      <SummaryCard
        label="P99"
        beforeValue={before?.p99_ms}
        afterValue={after.p99_ms}
        delta={after.p99_ms - (before?.p99_ms ?? 0)}
        formatter={formatDuration}
        invertDelta
      />
    </div>
  );
}

export const DeploymentCompareSummary = memo(DeploymentCompareSummaryComponent);
