import { useMemo } from 'react';

import type { DashboardPanelSpec, DashboardDataSources } from '@/types/dashboardConfig';

import DonutChart from '@shared/components/ui/charts/micro/DonutChart';
import { getChartColor } from '@shared/utils/charting';
import { CHART_THEME_DEFAULTS } from '@shared/utils/chartTheme';

import { useDashboardData } from '../hooks/useDashboardData';
import ChartNoDataOverlay from '@shared/components/ui/feedback/ChartNoDataOverlay';

/**
 *
 */
export function PieRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardPanelSpec;
  dataSources: DashboardDataSources;
}) {
  const { data: rows } = useDashboardData(chartConfig, dataSources);

  const labelKey = chartConfig.labelKey || chartConfig.groupByKey || 'label';
  const valueKey = chartConfig.valueKey || 'value';

  const chartData = useMemo(() => {
    const filtered = rows.filter((row) => row != null);
    if (filtered.length === 0) return null;

    const segments = filtered.map((row, index) => {
      const value = Number(row[valueKey]);
      const name = String(row[labelKey] ?? `Item ${index + 1}`);

      let color = getChartColor(index);
      if (name.startsWith('2xx'))
        color = '#10b981'; // Emerald 500 (Green)
      else if (name.startsWith('3xx'))
        color = '#3b82f6'; // Blue 500
      else if (name.startsWith('4xx'))
        color = '#ef4444'; // Red 500
      else if (name.startsWith('5xx')) color = '#eab308'; // Yellow 500

      return {
        name,
        value: Number.isFinite(value) ? value : 0,
        color,
      };
    });

    const total = segments.reduce((sum, segment) => sum + segment.value, 0);
    if (total <= 0) return null;

    return {
      segments,
      total,
    };
  }, [labelKey, rows, valueKey]);

  if (!chartData) {
    return <ChartNoDataOverlay />;
  }

  const textPrimary = CHART_THEME_DEFAULTS.textPrimary();
  const textSecondary = CHART_THEME_DEFAULTS.textSecondary();
  const borderColor = CHART_THEME_DEFAULTS.borderColor();

  return (
    <div className="flex h-full w-full items-center justify-center py-2">
      <DonutChart
        size={180}
        strokeWidth={20}
        segments={chartData.segments.map((segment) => ({
          label: segment.name,
          value: segment.value,
          color: segment.color,
        }))}
        centerValue={String(chartData.total)}
        centerLabel={chartConfig.title ?? 'Total'}
      />
    </div>
  );
}
