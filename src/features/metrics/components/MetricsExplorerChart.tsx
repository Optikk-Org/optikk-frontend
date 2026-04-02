import { BarChart3 } from 'lucide-react';

import { cn } from '@/lib/utils';
import ObservabilityChart, {
  type ObservabilityChartSeries,
} from '@shared/components/ui/charts/ObservabilityChart';
import { PageSurface } from '@shared/components/ui';

import { QUERY_LABEL_COLORS } from '../constants/metricsExplorerConstants';
import { getChartColor } from '@shared/utils/charting';
import type { ChartType, MetricExplorerResults, MetricQueryDefinition } from '../types';

interface MetricsExplorerChartProps {
  readonly queries: MetricQueryDefinition[];
  readonly results: MetricExplorerResults | undefined;
  readonly chartType: ChartType;
  readonly isLoading: boolean;
  readonly isError: boolean;
}

function buildSeries(
  queries: MetricQueryDefinition[],
  results: MetricExplorerResults,
  chartType: ChartType
): { timestamps: number[]; series: ObservabilityChartSeries[] } {
  const allSeries: ObservabilityChartSeries[] = [];
  let timestamps: number[] = [];
  let colorIdx = 0;

  for (const query of queries) {
    const result = results[query.id];
    if (!result) continue;

    if (result.timestamps.length > timestamps.length) {
      timestamps = result.timestamps;
    }

    const baseColor = QUERY_LABEL_COLORS[query.id] ?? getChartColor(colorIdx);

    for (const series of result.series) {
      const tagLabel = Object.values(series.tags).join(', ');
      const label = tagLabel
        ? `${query.id}: ${query.aggregation}(${query.metricName}) [${tagLabel}]`
        : `${query.id}: ${query.aggregation}(${query.metricName})`;

      allSeries.push({
        label,
        values: series.values,
        color: result.series.length > 1 ? getChartColor(colorIdx) : baseColor,
        fill: chartType === 'area',
      });
      colorIdx++;
    }
  }

  return { timestamps, series: allSeries };
}

export function MetricsExplorerChart({
  queries,
  results,
  chartType,
  isLoading,
  isError,
}: MetricsExplorerChartProps) {
  const hasResults = results && Object.keys(results).length > 0;
  const hasActiveQuery = queries.some((q) => q.metricName);

  if (!hasActiveQuery) {
    return (
      <PageSurface padding="lg" className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <BarChart3 size={40} className="text-[var(--text-muted)] opacity-40" />
          <div className="text-[14px] font-medium text-[var(--text-secondary)]">
            Select a metric to start exploring
          </div>
          <div className="max-w-[320px] text-[12px] text-[var(--text-muted)]">
            Choose a metric name and aggregation function to visualize your data over time.
          </div>
        </div>
      </PageSurface>
    );
  }

  if (isLoading && !hasResults) {
    return (
      <PageSurface padding="lg" className="min-h-[400px]">
        <div className="flex h-[360px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--text-muted)] border-t-[var(--color-primary)]" />
        </div>
      </PageSurface>
    );
  }

  if (isError) {
    return (
      <PageSurface padding="lg" className="min-h-[400px]">
        <div className="flex h-[360px] items-center justify-center">
          <div className="text-[13px] text-[var(--color-error)]">
            Failed to load metrics data. Please try again.
          </div>
        </div>
      </PageSurface>
    );
  }

  if (!hasResults) {
    return (
      <PageSurface padding="lg" className="min-h-[400px]">
        <div className="flex h-[360px] items-center justify-center">
          <div className="text-[13px] text-[var(--text-muted)]">No data for the selected query.</div>
        </div>
      </PageSurface>
    );
  }

  const { timestamps, series } = buildSeries(queries, results, chartType);

  return (
    <PageSurface
      padding="lg"
      className={cn('min-h-[400px]', isLoading && 'opacity-70 transition-opacity duration-200')}
    >
      <ObservabilityChart
        timestamps={timestamps}
        series={series}
        height={360}
        legend
      />
    </PageSurface>
  );
}
