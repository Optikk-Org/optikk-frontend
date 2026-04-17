import { memo } from "react";

import { PageSurface } from "@shared/components/ui";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";

import type { DatastoreOverview } from "../../../api/saturationApi";

interface Props {
  overview?: DatastoreOverview;
}

function DatastoreOverviewCardComponent({ overview }: Props) {
  const topCollections = overview?.top_collections ?? [];

  return (
    <PageSurface padding="lg">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Overview
          </div>
          <h2 className="mt-2 font-semibold text-[20px] text-[var(--text-primary)]">
            Top collections and primary endpoint
          </h2>
          <p className="mt-2 max-w-2xl text-[13px] text-[var(--text-secondary)] leading-6">
            Use this system page to follow the highest-latency collections, the dominant server
            endpoint, and the most likely contention sources.
          </p>
        </div>
        <div className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[rgba(255,255,255,0.02)] px-4 py-3 text-[12px] text-[var(--text-secondary)]">
          <div className="font-medium text-[var(--text-primary)]">Primary endpoint</div>
          <div className="mt-1">{overview?.top_server || "No server address detected"}</div>
          <div className="mt-2">
            Cache hit rate{" "}
            {overview?.cache_hit_rate != null ? formatPercentage(overview.cache_hit_rate) : "n/a"}
          </div>
        </div>
      </div>
      {topCollections.length > 0 ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {topCollections.map((collection) => (
            <div
              key={collection.collection_name}
              className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[rgba(255,255,255,0.02)] px-4 py-3"
            >
              <div className="font-medium text-[var(--text-primary)]">
                {collection.collection_name}
              </div>
              <div className="mt-2 text-[12px] text-[var(--text-secondary)]">
                {formatDuration(collection.p99_ms)} p99 • {formatNumber(collection.ops_per_sec)}{" "}
                ops/s
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </PageSurface>
  );
}

export const DatastoreOverviewCard = memo(DatastoreOverviewCardComponent);
