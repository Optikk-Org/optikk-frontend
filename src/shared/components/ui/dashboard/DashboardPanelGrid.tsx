import { useMemo } from 'react';

import { cn } from '@/lib/utils';

import type {
  DashboardDataSources,
  DashboardExtraContext,
  DashboardPanelPreset,
  DashboardPanelSpec,
  DashboardSectionLayoutMode,
} from '@/types/dashboardConfig';

import type { ApiErrorShape } from '@shared/api/api/interceptors/errorInterceptor';

import ConfigurableChartCard from './ConfigurableChartCard';

interface DashboardPanelGridProps {
  panels: DashboardPanelSpec[];
  layoutMode: DashboardSectionLayoutMode;
  dataSources: DashboardDataSources;
  errors: Record<string, ApiErrorShape | null>;
  isLoading: boolean;
  extraContext: DashboardExtraContext;
}

function isFullSpanPanel(panel: DashboardPanelSpec): boolean {
  const preset = panel.layout?.preset;
  return preset === 'hero' || preset === 'detail';
}

export function resolveSectionGridClasses(layoutMode: DashboardSectionLayoutMode): string {
  switch (layoutMode) {
    case 'kpi-strip':
      return 'grid grid-cols-1 gap-[var(--space-xs)] md:grid-cols-2 xl:grid-cols-4';
    case 'two-up':
      return 'grid grid-cols-1 gap-[var(--space-xs)] xl:grid-cols-2';
    case 'three-up':
      return 'grid grid-cols-1 gap-[var(--space-xs)] md:grid-cols-2 xl:grid-cols-3';
    case 'stack':
    default:
      return 'grid grid-cols-1 gap-[var(--space-xs)]';
  }
}

export function resolvePanelSpanClasses(
  layoutMode: DashboardSectionLayoutMode,
  panel: DashboardPanelSpec
): string {
  const colSpan = panel.layout?.colSpan;
  if (colSpan && colSpan > 1) {
    if (layoutMode === 'two-up') {
      return colSpan >= 2 ? 'xl:col-span-2' : '';
    }
    if (layoutMode === 'three-up') {
      if (colSpan >= 3) return 'md:col-span-2 xl:col-span-3';
      if (colSpan >= 2) return 'md:col-span-2 xl:col-span-2';
    }
    if (layoutMode === 'kpi-strip') {
      if (colSpan >= 4) return 'md:col-span-2 xl:col-span-4';
      if (colSpan >= 3) return 'md:col-span-2 xl:col-span-3';
      if (colSpan >= 2) return 'md:col-span-2 xl:col-span-2';
    }
    return '';
  }

  if (layoutMode === 'two-up' && isFullSpanPanel(panel)) {
    return 'xl:col-span-2';
  }

  if (layoutMode === 'three-up' && isFullSpanPanel(panel)) {
    return 'md:col-span-2 xl:col-span-3';
  }

  return '';
}

export function resolvePanelHeightClasses(
  preset: DashboardPanelPreset,
  panel?: DashboardPanelSpec
): string {
  if (
    panel?.panelType === 'error-hotspot-ranking' ||
    panel?.id === 'top-slow-operations' ||
    panel?.id === 'top-error-operations'
  ) {
    return 'h-[440px]';
  }

  if (panel?.panelType === 'gauge' && panel.groupByKey) {
    return 'h-[440px]';
  }

  switch (preset) {
    case 'kpi':
      return 'min-h-[120px]';
    case 'breakdown':
      return 'min-h-[240px]';
    case 'trend':
      return 'min-h-[280px]';
    case 'hero':
      return 'min-h-[320px]';
    case 'detail':
    default:
      return 'min-h-[340px]';
  }
}

export default function DashboardPanelGrid({
  panels,
  layoutMode,
  dataSources,
  errors,
  isLoading,
  extraContext,
}: DashboardPanelGridProps) {
  const orderedPanels = useMemo(
    () =>
      [...panels].sort((left, right) => {
        if (left.order === right.order) {
          return left.id.localeCompare(right.id);
        }
        return left.order - right.order;
      }),
    [panels]
  );

  return (
    <div className={resolveSectionGridClasses(layoutMode)}>
      {orderedPanels.map((panelConfig) => (
        <div
          key={panelConfig.id}
          className={cn(
            'min-w-0',
            resolvePanelSpanClasses(layoutMode, panelConfig),
            resolvePanelHeightClasses(panelConfig.layout?.preset ?? 'detail', panelConfig)
          )}
        >
          <ConfigurableChartCard
            componentConfig={panelConfig}
            dataSources={dataSources}
            error={errors[panelConfig.id] ?? null}
            isLoading={isLoading}
            extraContext={extraContext}
          />
        </div>
      ))}
    </div>
  );
}
