import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

import type {
  DashboardComponentSpec,
  DashboardDataSources,
} from '@/types/dashboardConfig';

import { getChartColor } from '@shared/utils/echarts';

import { APP_COLORS } from '@config/colorLiterals';

import { useDashboardData } from '../hooks/useDashboardData';

/**
 *
 */
export function PieRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
}) {
  const { data: rows } = useDashboardData(chartConfig, dataSources);

  const labelKey = chartConfig.labelKey || chartConfig.groupByKey || 'label';
  const valueKey = chartConfig.valueKey || 'value';

  const option = useMemo(() => {
    const filtered = rows.filter((row) => row != null);
    if (filtered.length === 0) return null;

    const seriesData = filtered.map((row, index) => {
      const value = Number(row[valueKey]);
      return {
        name: String(row[labelKey] ?? `Item ${index + 1}`),
        value: Number.isFinite(value) ? value : 0,
        itemStyle: {
          color: `${getChartColor(index)}CC`,
          borderColor: getChartColor(index),
          borderWidth: 1,
        },
      };
    });

    if (!seriesData.some((d) => d.value > 0)) return null;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: APP_COLORS.hex_1a1a1a_2,
        borderColor: APP_COLORS.hex_2d2d2d,
        borderWidth: 1,
        textStyle: { color: APP_COLORS.hex_fff, fontSize: 12 },
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        show: true,
        orient: 'vertical',
        right: 8,
        top: 'center',
        textStyle: { color: APP_COLORS.hex_666, fontSize: 11 },
      },
      series: [{
        type: 'pie',
        radius: ['70%', '90%'],
        center: ['40%', '50%'],
        data: seriesData,
        label: { show: false },
        emphasis: {
          itemStyle: { shadowBlur: 6, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.4)' },
        },
      }],
    };
  }, [labelKey, rows, valueKey]);

  if (!option) {
    return <div className="text-muted" style={{ textAlign: 'center', padding: 32 }}>No data</div>;
  }

  return <ReactECharts option={option} style={{ height: '100%' }} />;
}
