import ReactECharts from 'echarts-for-react';

import { Card, Skeleton } from '@/components/ui';

interface PremiumChartProps {
  title: string;
  subtitle?: string;
  option: Record<string, unknown>;
  height?: number;
  isLoading?: boolean;
}

export function PremiumChart({
  title,
  subtitle,
  option,
  height = 260,
  isLoading,
}: PremiumChartProps): JSX.Element {
  return (
    <Card
      padding="lg"
      className="overflow-hidden border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(18,24,38,0.96),rgba(10,14,24,0.9))] shadow-[0_24px_64px_rgba(0,0,0,0.28)]"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-xs text-[var(--text-muted)]">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {isLoading ? (
        <Skeleton height={height} className="rounded-xl" />
      ) : (
        <ReactECharts option={option} style={{ height }} notMerge lazyUpdate />
      )}
    </Card>
  );
}
