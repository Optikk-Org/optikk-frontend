import { Col, Row } from 'antd';
import { useState } from 'react';

import type {
  ComponentGroup,
  DashboardComponentSpec,
  DashboardDataSources,
  DashboardExtraContext,
  DashboardRenderConfig,
} from '@/types/dashboardConfig';

import ConfigurableChartCard from './ConfigurableChartCard';

interface ConfigurableDashboardProps {
  config: DashboardRenderConfig | null;
  dataSources?: DashboardDataSources;
  isLoading?: boolean;
  extraContext?: DashboardExtraContext;
}

/** Groups flat components into visual rows based on cumulative col spans. */
function computeRows(components: DashboardComponentSpec[]): DashboardComponentSpec[][] {
  const rows: DashboardComponentSpec[][] = [];
  let current: DashboardComponentSpec[] = [];
  let used = 0;

  for (const c of components) {
    const span = c.layout?.col || 12;
    if (used + span > 24 && current.length > 0) {
      rows.push(current);
      current = [];
      used = 0;
    }
    current.push(c);
    used += span;
    if (used >= 24) {
      rows.push(current);
      current = [];
      used = 0;
    }
  }
  if (current.length > 0) rows.push(current);
  return rows;
}

interface GroupedSection {
  group: ComponentGroup | null; // null = ungrouped fallback
  rows: DashboardComponentSpec[][];
}

/**
 * Builds an ordered list of sections. If groups are provided, components are
 * bucketed by groupId. Components with no groupId are appended at the end as
 * an ungrouped section. If no groups are provided, all components are treated
 * as a single ungrouped section (backwards-compatible behaviour).
 */
function computeGroupedLayout(
  components: DashboardComponentSpec[],
  groups: ComponentGroup[],
): GroupedSection[] {
  if (groups.length === 0) {
    return [{ group: null, rows: computeRows(components) }];
  }

  const sorted = [...groups].sort((a, b) => a.order - b.order);
  const sections: GroupedSection[] = sorted.map((g) => ({
    group: g,
    rows: computeRows(components.filter((c) => c.groupId === g.id).sort((a, b) => a.order - b.order)),
  }));

  const ungrouped = components.filter((c) => !c.groupId || !sorted.find((g) => g.id === c.groupId));
  if (ungrouped.length > 0) {
    sections.push({ group: null, rows: computeRows(ungrouped.sort((a, b) => a.order - b.order)) });
  }

  return sections.filter((s) => s.rows.length > 0);
}

function RowGrid({
  rowComponents,
  dataSources,
  extraContext,
}: {
  rowComponents: DashboardComponentSpec[];
  dataSources: DashboardDataSources;
  extraContext: DashboardExtraContext;
}) {
  return (
    <Row gutter={[16, 0]} align="stretch" style={{ marginBottom: 0 }}>
      {rowComponents.map((componentConfig) => {
        const colSpan = componentConfig.layout?.col || 12;
        return (
          <Col
            key={componentConfig.id}
            xs={24}
            lg={colSpan}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <ConfigurableChartCard
              componentConfig={componentConfig}
              dataSources={dataSources}
              extraContext={extraContext}
            />
          </Col>
        );
      })}
    </Row>
  );
}

/**
 * ConfigurableDashboard renders a grid of charts.
 *
 * When groups are provided (via config.groups), components are organized into
 * named collapsible sections. Collapsing a group hides all its rows at once.
 *
 * When no groups are present, falls back to the original per-row collapse
 * behaviour so existing ungrouped pages are unaffected.
 */
export default function ConfigurableDashboard({
  config,
  dataSources = {},
  extraContext = {},
}: ConfigurableDashboardProps) {
  const groups = config?.groups ?? [];
  const sections = config ? computeGroupedLayout(config.components, groups) : [];

  // For named groups: keyed by group.id. For ungrouped rows: keyed by `__row_<idx>`.
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {sections.map((section, sectionIdx) => {
        const isNamedGroup = section.group !== null;

        if (isNamedGroup) {
          const groupKey = section.group!.id;
          const isCollapsed = collapsed.has(groupKey);

          return (
            <div key={groupKey}>
              {/* Group header — bolder, larger than row titles */}
              <div
                onClick={() => toggle(groupKey)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  marginBottom: isCollapsed ? 0 : 12,
                  padding: '4px 0',
                  userSelect: 'none',
                  borderBottom: isCollapsed ? 'none' : '1px solid var(--border-subtle, #f0f0f0)',
                }}
              >
                <span style={{
                  fontSize: 13,
                  color: 'var(--text-muted, #555)',
                  transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s',
                  display: 'inline-block',
                  lineHeight: 1,
                }}>▾</span>
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-secondary, #555)',
                  letterSpacing: '0.01em',
                }}>
                  {section.group!.label}
                </span>
              </div>

              {!isCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {section.rows.map((rowComponents, rowIdx) => (
                    <RowGrid
                      key={rowIdx}
                      rowComponents={rowComponents}
                      dataSources={dataSources}
                      extraContext={extraContext}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        }

        // Ungrouped fallback: per-row collapse (original behaviour)
        return (
          <div key={`__ungrouped_${sectionIdx}`} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {section.rows.map((rowComponents, rowIdx) => {
              const rowKey = `__row_${sectionIdx}_${rowIdx}`;
              const isCollapsed = collapsed.has(rowKey);
              const rowTitle = rowComponents.map((c) => c.title as string).filter(Boolean).join(' · ');

              return (
                <div key={rowIdx}>
                  <div
                    onClick={() => toggle(rowKey)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      marginBottom: isCollapsed ? 0 : 8,
                      padding: '2px 0',
                      userSelect: 'none',
                    }}
                  >
                    <span style={{
                      fontSize: 11,
                      color: 'var(--text-muted, #666)',
                      transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.15s',
                      display: 'inline-block',
                      lineHeight: 1,
                    }}>▾</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted, #888)', letterSpacing: '0.02em' }}>
                      {rowTitle}
                    </span>
                  </div>

                  {!isCollapsed && (
                    <RowGrid
                      rowComponents={rowComponents}
                      dataSources={dataSources}
                      extraContext={extraContext}
                    />
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
