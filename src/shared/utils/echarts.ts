/**
 * ECharts utilities — theme registration, base options, dataset helpers.
 * Replaces chartHelpers.ts (Chart.js) and chartSetup.ts.
 */
import * as echarts from 'echarts/core';
import { APP_COLORS } from '@config/colorLiterals';
import { CHART_COLORS } from '@config/constants';

/** Dark theme defaults shared by every ECharts instance. */
export const ECHARTS_THEME = {
  backgroundColor: 'transparent',
  textStyle: { color: APP_COLORS.hex_8e8e8e, fontFamily: 'inherit' },
  title: { textStyle: { color: APP_COLORS.hex_fff } },
  legend: { textStyle: { color: APP_COLORS.hex_8e8e8e } },
  tooltip: {
    backgroundColor: APP_COLORS.hex_1a1a1a_2,
    borderColor: APP_COLORS.hex_2d2d2d,
    borderWidth: 1,
    textStyle: { color: APP_COLORS.hex_fff, fontSize: 12 },
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    axisTick: { show: false },
    axisLabel: { color: APP_COLORS.hex_8e8e8e, fontSize: 11 },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
  },
  valueAxis: {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: APP_COLORS.hex_8e8e8e, fontSize: 11 },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
  },
};

/** Base ECharts option for time-series line charts with interaction kept in-chart. */
export function baseLineOption(overrides: Record<string, any> = {}): any {
  const { toolbox: _toolbox, ...restOverrides } = overrides;

  return {
    backgroundColor: 'transparent',
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', lineStyle: { color: 'rgba(255,255,255,0.2)' } },
      ...ECHARTS_THEME.tooltip,
      ...restOverrides.tooltip,
    },
    legend: { show: false, ...restOverrides.legend },
    grid: {
      left: 48,
      right: 16,
      top: 8,
      bottom: 32,
      containLabel: false,
      ...restOverrides.grid,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
      axisTick: { show: false },
      axisLabel: { color: APP_COLORS.hex_8e8e8e, fontSize: 11, rotate: 0 },
      ...restOverrides.xAxis,
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: APP_COLORS.hex_8e8e8e, fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      ...restOverrides.yAxis,
    },
    dataZoom: restOverrides.dataZoom ?? [
      {
        type: 'inside',
        xAxisIndex: 0,
        filterMode: 'none',
        zoomOnMouseWheel: 'ctrl',
      },
    ],
    ...restOverrides,
  };
}

/** Create an ECharts line series. */
export function lineSeries(
  name: string,
  data: (number | null)[],
  color: string,
  fill = false,
): any {
  return {
    name,
    type: 'line',
    data,
    smooth: false,
    symbol: 'none',
    symbolSize: 0,
    lineStyle: { width: 1.5, color },
    itemStyle: { color },
    emphasis: { focus: 'series' },
    areaStyle: fill
      ? {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: `${color}33` },
            { offset: 1, color: `${color}05` },
          ]),
        }
      : undefined,
  };
}

/** Create an ECharts bar series. */
export function barSeries(
  name: string,
  data: (number | null)[],
  color: string,
): any {
  return {
    name,
    type: 'bar',
    data,
    itemStyle: { color: `${color}CC`, borderColor: color, borderWidth: 1, borderRadius: 2 },
  };
}

/** Get a color from the chart palette by index. */
export function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/**
 * Format timestamps for chart x-axis labels.
 */
export function formatChartLabels<T extends Record<string, any>>(
  data: T[],
  timestampKey = 'timestamp',
): string[] {
  if (!data || data.length === 0) return [];
  const timestamps = data.map((d) => new Date(d[timestampKey] as string | number).getTime());
  const spanMs = Math.max(...timestamps) - Math.min(...timestamps);
  const DAY = 86400000;
  return data.map((d) => {
    const date = new Date(d[timestampKey] as string | number);
    if (spanMs <= DAY) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (spanMs <= 7 * DAY) return date.toLocaleDateString([], { weekday: 'short' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  });
}

/**
 * Generate time bucket strings spanning [startMs, endMs].
 */
export function generateTimeBuckets(startMs: number, endMs: number): string[] {
  const rangeMs = endMs - startMs;
  let stepMs: number;
  if (rangeMs <= 3 * 3600000) stepMs = 60000;
  else if (rangeMs <= 86400000) stepMs = 300000;
  else stepMs = 3600000;

  const alignedStart = Math.floor(startMs / stepMs) * stepMs;
  const buckets: string[] = [];
  for (let t = alignedStart; t <= endMs; t += stepMs) {
    buckets.push(new Date(t).toISOString());
  }
  return buckets;
}
