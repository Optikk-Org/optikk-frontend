import { Surface } from "@/components/ui";
import { formatNumber, formatPercentage } from "@shared/utils/formatters";

import { useSloStats } from "./useSloStats";

interface SloStatsCardProps {
  readonly serviceName: string;
}

function sloTone(sli: number | null | undefined): string {
  if (sli == null) return "text-[var(--text-muted)]";
  const pct = sli <= 1 ? sli * 100 : sli;
  if (pct >= 99.5) return "text-[var(--color-success)]";
  if (pct >= 99.0) return "text-[var(--color-warning)]";
  return "text-[var(--color-error)]";
}

function StatsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className="font-medium text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

export default function SloStatsCard({ serviceName }: SloStatsCardProps) {
  const { stats } = useSloStats(serviceName);
  const sli = stats?.sli ?? null;
  const displaySli = sli == null ? "—" : formatPercentage(sli);

  return (
    <Surface elevation={1} padding="sm" className="flex h-full flex-col gap-2">
      <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
        SLO compliance
      </span>
      <div className={`font-semibold text-[28px] leading-none ${sloTone(sli)}`}>{displaySli}</div>
      <div className="mt-1 flex flex-col gap-1">
        <StatsRow label="Target" value={stats?.slo == null ? "—" : formatPercentage(stats.slo)} />
        <StatsRow label="Good events" value={formatNumber(stats?.good_events ?? 0)} />
        <StatsRow label="Total events" value={formatNumber(stats?.total_events ?? 0)} />
      </div>
    </Surface>
  );
}
