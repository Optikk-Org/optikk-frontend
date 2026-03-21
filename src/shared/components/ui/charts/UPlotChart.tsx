import { useEffect, useRef, useMemo } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';

import { useChartTimeBuckets } from '@shared/hooks/useChartTimeBuckets';

export interface UPlotChartProps {
  options: Omit<uPlot.Options, 'width' | 'height'>;
  data: uPlot.AlignedData;
  height?: number;
  className?: string;
}

/**
 * Generic uPlot wrapper with auto-resize, theme-aware defaults, and cleanup.
 */
export default function UPlotChart({
  options,
  data,
  height = 260,
  className,
}: UPlotChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<uPlot | null>(null);

  // Memoize the merged options to avoid unnecessary re-renders
  const mergedOptions = useMemo(() => ({
    ...options,
    width: 100, // will be resized immediately
    height,
    cursor: {
      drag: { x: true, y: false, setScale: true },
      ...options.cursor,
    },
  }), [options, height]);

  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const opts = { ...mergedOptions, width: el.clientWidth };

    chartRef.current = new uPlot(opts, data, el);

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0 && chartRef.current) {
          chartRef.current.setSize({ width: w, height });
        }
      }
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [mergedOptions, data, height]);

  return <div ref={containerRef} className={className} />;
}

// ── Shared helpers for building uPlot options ──────────────────────────────

/** CSS variable reader (falls back to a default if the var is not set). */
function cssVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/** Default axis styling matching the app's dark theme. */
export function defaultAxes(): uPlot.Axis[] {
  const gridColor = 'rgba(255,255,255,0.05)';
  const labelColor = cssVar('--text-secondary', '#8e8e8e');

  return [
    {
      stroke: labelColor,
      grid: { stroke: gridColor, width: 1 },
      ticks: { show: false },
      font: '11px inherit',
    },
    {
      stroke: labelColor,
      grid: { stroke: gridColor, width: 1 },
      ticks: { show: false },
      font: '11px inherit',
      size: 48,
    },
  ];
}

/** Build a line series config for uPlot. */
export function uLine(
  label: string,
  color: string,
  opts?: { fill?: boolean; dash?: number[]; width?: number },
): uPlot.Series {
  return {
    label,
    stroke: color,
    width: opts?.width ?? 1.5,
    fill: opts?.fill ? `${color}22` : undefined,
    dash: opts?.dash,
    points: { show: false },
  };
}

/** Build a bars series config for uPlot. */
export function uBars(label: string, color: string): uPlot.Series {
  return {
    label,
    stroke: color,
    fill: `${color}CC`,
    points: { show: false },
    paths: uPlot.paths.bars!({ size: [0.6, 100], radius: 2 }),
  };
}

/** Re-export the time bucket hook for chart consumers. */
export { useChartTimeBuckets };
