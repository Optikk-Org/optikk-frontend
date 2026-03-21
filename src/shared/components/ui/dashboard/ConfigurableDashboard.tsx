import { useMemo, useState } from 'react';
import { GridLayout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

import type { LayoutItem } from 'react-grid-layout';

import { cn } from '@/lib/utils';

import type {
  ComponentGroup,
  DashboardComponentSpec,
  DashboardDataSources,
  DashboardExtraContext,
  DashboardRenderConfig,
} from '@/types/dashboardConfig';

import type { ApiErrorShape } from '@shared/api/api/interceptors/errorInterceptor';

import ConfigurableChartCard from './ConfigurableChartCard';

interface ConfigurableDashboardProps {
  config: DashboardRenderConfig | null;
  dataSources?: DashboardDataSources;
  errors?: Record<string, ApiErrorShape | null>;
  isLoading?: boolean;
  extraContext?: DashboardExtraContext;
}

const COLS = 24;
const ROW_HEIGHT = 280;
const MARGIN: [number, number] = [12, 12];

/** Convert flat components into react-grid-layout items with x/y positions. */
function computeGridLayout(components: DashboardComponentSpec[]): LayoutItem[] {
  const items: LayoutItem[] = [];
  let x = 0;
  let y = 0;

  for (const c of components) {
    const w = c.layout?.col || 12;
    if (x + w > COLS && x > 0) {
      x = 0;
      y += 1;
    }
    items.push({
      i: c.id,
      x,
      y,
      w,
      h: 1,
      static: true,
    });
    x += w;
    if (x >= COLS) {
      x = 0;
      y += 1;
    }
  }
  return items;
}

interface GroupedSection {
  group: ComponentGroup | null;
  components: DashboardComponentSpec[];
}

function computeGroupedSections(
  components: DashboardComponentSpec[],
  groups: ComponentGroup[],
): GroupedSection[] {
  if (groups.length === 0) {
    return [{ group: null, components }];
  }

  const sorted = [...groups].sort((a, b) => a.order - b.order);
  const sections: GroupedSection[] = sorted.map((g) => ({
    group: g,
    components: components.filter((c) => c.groupId === g.id).sort((a, b) => a.order - b.order),
  }));

  const ungrouped = components.filter((c) => !c.groupId || !sorted.find((g) => g.id === c.groupId));
  if (ungrouped.length > 0) {
    sections.push({ group: null, components: ungrouped.sort((a, b) => a.order - b.order) });
  }

  return sections.filter((s) => s.components.length > 0);
}

function SectionGrid({
  components,
  dataSources,
  errors,
  isLoading,
  extraContext,
}: {
  components: DashboardComponentSpec[];
  dataSources: DashboardDataSources;
  errors: Record<string, ApiErrorShape | null>;
  isLoading: boolean;
  extraContext: DashboardExtraContext;
}) {
  const layout = useMemo(() => computeGridLayout(components), [components]);
  const maxY = layout.length > 0 ? Math.max(...layout.map((l) => l.y)) + 1 : 0;

  // Build a lookup for components by id
  const componentMap = useMemo(() => {
    const map = new Map<string, DashboardComponentSpec>();
    for (const c of components) map.set(c.id, c);
    return map;
  }, [components]);

  return (
    <GridLayout
      layout={layout}
      width={1200}
      gridConfig={{
        cols: COLS,
        rowHeight: ROW_HEIGHT,
        margin: MARGIN,
        containerPadding: null,
        maxRows: Infinity,
      }}
      dragConfig={{ enabled: false }}
      resizeConfig={{ enabled: false }}
    >
      {layout.map((item) => {
        const componentConfig = componentMap.get(item.i);
        if (!componentConfig) return null;
        return (
          <div key={item.i}>
            <ConfigurableChartCard
              componentConfig={componentConfig}
              dataSources={dataSources}
              error={errors[item.i] ?? null}
              isLoading={isLoading}
              extraContext={extraContext}
            />
          </div>
        );
      })}
    </GridLayout>
  );
}

export default function ConfigurableDashboard({
  config,
  dataSources = {},
  errors = {},
  isLoading = false,
  extraContext = {},
}: ConfigurableDashboardProps) {
  const groups = config?.groups ?? [];
  const sections = config ? computeGroupedSections(config.components, groups) : [];
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  if (!config || config.components.length === 0) return null;

  const toggle = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-[var(--space-md)]">
      {sections.map((section, sectionIdx) => {
        const isNamedGroup = section.group !== null;

        if (isNamedGroup) {
          const groupKey = section.group!.id;
          const isGroupCollapsed = collapsed.has(groupKey);

          return (
            <div key={groupKey}>
              <div
                onClick={() => toggle(groupKey)}
                className={cn(
                  'flex items-center gap-[var(--space-xs)] cursor-pointer py-[2px] select-none',
                  isGroupCollapsed ? 'mb-0' : 'mb-[var(--space-xs)] border-b border-[var(--border-light)]',
                )}
              >
                <span
                  className={cn(
                    'text-[var(--text-sm)] text-[color:var(--text-muted)] inline-block leading-none transition-transform duration-150',
                    isGroupCollapsed && '-rotate-90',
                  )}
                >▾</span>
                <span className="text-[var(--text-sm)] font-semibold text-[color:var(--text-secondary)] tracking-[0.01em]">
                  {section.group!.label}
                </span>
              </div>

              {!isGroupCollapsed && (
                <SectionGrid
                  components={section.components}
                  dataSources={dataSources}
                  errors={errors}
                  isLoading={isLoading}
                  extraContext={extraContext}
                />
              )}
            </div>
          );
        }

        return (
          <div key={`__ungrouped_${sectionIdx}`}>
            <SectionGrid
              components={section.components}
              dataSources={dataSources}
              errors={errors}
              isLoading={isLoading}
              extraContext={extraContext}
            />
          </div>
        );
      })}
    </div>
  );
}
