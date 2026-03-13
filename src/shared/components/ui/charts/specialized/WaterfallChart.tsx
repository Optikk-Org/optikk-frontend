import { useState, useMemo } from 'react';
import { Input } from 'antd';

import { formatDuration } from '@shared/utils/formatters';

import { CHART_COLORS, STATUS_COLORS } from '@config/constants';
import './WaterfallChart.css';

const KIND_COLORS: Record<string, string> = {
  SERVER: '#648FFF',
  CLIENT: '#785EF0',
  INTERNAL: '#6b7280',
  PRODUCER: '#06aed5',
  CONSUMER: '#73c991',
};

function kindColor(kind: string): string {
  return KIND_COLORS[(kind ?? '').toUpperCase()] ?? '#9ca3af';
}

interface WaterfallChartProps {
  spans?: any[];
  onSpanClick?: (span: any) => void;
  selectedSpanId?: string | null;
  criticalPathSpanIds?: Set<string>;
  errorPathSpanIds?: Set<string>;
}

export default function WaterfallChart({
  spans = [],
  onSpanClick,
  selectedSpanId,
  criticalPathSpanIds,
  errorPathSpanIds,
}: WaterfallChartProps) {
  const [hoveredSpanId, setHoveredSpanId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeService, setActiveService] = useState<string | null>(null);

  const { spanTree, traceStart, traceDuration } = useMemo(() => {
    if (!spans || spans.length === 0) {
      return { spanTree: [], traceStart: 0, traceEnd: 0, traceDuration: 0 };
    }

    const startTimes = (spans as any[]).map((s) => new Date(s.start_time).getTime());
    const endTimes = (spans as any[]).map((s) => new Date(s.end_time).getTime());
    const traceStart = Math.min(...startTimes);
    const traceEnd = Math.max(...endTimes);
    const traceDuration = traceEnd - traceStart;

    const childrenMap: Record<string, string[]> = {};
    const spanMap: Record<string, any> = {};

    (spans as any[]).forEach((span) => {
      spanMap[span.span_id] = span;
      if (!childrenMap[span.span_id]) childrenMap[span.span_id] = [];
    });

    (spans as any[]).forEach((span) => {
      if (span.parent_span_id) {
        if (!childrenMap[span.parent_span_id]) childrenMap[span.parent_span_id] = [];
        childrenMap[span.parent_span_id].push(span.span_id);
      }
    });

    const roots = (spans as any[]).filter((s) => !s.parent_span_id || !spanMap[s.parent_span_id]);
    const tree: any[] = [];
    const visited = new Set();

    const dfs = (spanId: string, depth: number) => {
      if (visited.has(spanId)) return;
      visited.add(spanId);
      const span = spanMap[spanId];
      if (!span) return;
      tree.push({ ...span, depth });
      const children = childrenMap[spanId] || [];
      children
        .map((id) => spanMap[id])
        .filter(Boolean)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
        .forEach((child) => dfs(child.span_id, depth + 1));
    };

    roots
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .forEach((root) => dfs(root.span_id, 0));

    return { spanTree: tree, traceStart, traceEnd, traceDuration };
  }, [spans]);

  const services = useMemo(() => {
    const s = new Set<string>();
    spanTree.forEach((sp) => sp.service_name && s.add(sp.service_name));
    return Array.from(s);
  }, [spanTree]);

  const filteredTree = useMemo(() => {
    return spanTree.filter((sp) => {
      const matchesSearch =
        !search ||
        (sp.service_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (sp.operation_name ?? '').toLowerCase().includes(search.toLowerCase());
      const matchesService = !activeService || sp.service_name === activeService;
      return matchesSearch && matchesService;
    });
  }, [spanTree, search, activeService]);

  const getServiceColor = (serviceName: string, status: string) => {
    if (status === 'ERROR') return STATUS_COLORS.ERROR;
    const hash = (serviceName ?? '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return CHART_COLORS[hash % CHART_COLORS.length];
  };

  const getBarStyle = (span: any, index: number) => {
    const startTime = new Date(span.start_time).getTime();
    const endTime = new Date(span.end_time).getTime();
    const leftPercent = traceDuration > 0 ? ((startTime - traceStart) / traceDuration) * 100 : 0;
    const widthPercent = traceDuration > 0 ? ((endTime - startTime) / traceDuration) * 100 : 0;
    const baseColor = getServiceColor(span.service_name || 'unknown', span.status);
    const backgroundStr = baseColor.startsWith('#')
      ? `linear-gradient(90deg, ${baseColor}, ${baseColor}dd)`
      : baseColor;
    return {
      left: `${leftPercent}%`,
      width: `${Math.max(widthPercent, 0.5)}%`,
      background: backgroundStr,
      animationDelay: `${Math.min(index * 0.05, 1.5)}s`,
    };
  };

  const getTimeAxisLabels = () => {
    const labels: string[] = [];
    for (let i = 0; i <= 5; i++) labels.push(formatDuration((traceDuration * i) / 5));
    return labels;
  };

  if (!spans || spans.length === 0) {
    return <div className="waterfall-empty">No spans available</div>;
  }

  const timeLabels = getTimeAxisLabels();
  const hasCritical = criticalPathSpanIds && criticalPathSpanIds.size > 0;
  const hasErrorPath = errorPathSpanIds && errorPathSpanIds.size > 0;

  return (
    <div className="waterfall-chart">
      {/* Search + filter toolbar */}
      <div
        style={{
          padding: '10px 12px',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--glass-border)',
        }}
      >
        <Input
          placeholder="Search spans..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="small"
          style={{ width: 200 }}
        />
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <span
            onClick={() => setActiveService(null)}
            style={{
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: 11,
              cursor: 'pointer',
              background: activeService === null ? 'var(--glass-border)' : 'transparent',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-secondary)',
            }}
          >
            All
          </span>
          {services.map((svc) => {
            const color = getServiceColor(svc, '');
            const isActive = activeService === svc;
            return (
              <span
                key={svc}
                onClick={() => setActiveService(isActive ? null : svc)}
                style={{
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 11,
                  cursor: 'pointer',
                  background: isActive ? `${color}22` : 'transparent',
                  border: `1px solid ${isActive ? color : 'var(--glass-border)'}`,
                  color: isActive ? color : 'var(--text-secondary)',
                }}
              >
                {svc}
              </span>
            );
          })}
        </div>
        {(hasCritical || hasErrorPath) && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
            {hasCritical && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 3, background: '#f59e0b', borderRadius: 2, display: 'inline-block' }} />
                Critical path
              </span>
            )}
            {hasErrorPath && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 3, background: '#f04438', borderRadius: 2, display: 'inline-block' }} />
                Error path
              </span>
            )}
          </span>
        )}
      </div>

      {/* Column header */}
      <div className="waterfall-header">
        <div className="waterfall-labels-column" style={{ width: 300, minWidth: 300 }}>
          <span className="waterfall-header-title">Span</span>
        </div>
        <div
          style={{
            width: 60,
            minWidth: 60,
            borderRight: '1px solid var(--glass-border)',
            padding: '12px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>%</span>
        </div>
        <div className="waterfall-timeline-column">
          <div className="waterfall-time-axis">
            {timeLabels.map((label, idx) => (
              <span key={idx} className="waterfall-time-label">{label}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="waterfall-body">
        {filteredTree.map((span, index) => {
          const isCritical = criticalPathSpanIds?.has(span.span_id);
          const isError = errorPathSpanIds?.has(span.span_id);
          const isSelected = selectedSpanId === span.span_id;
          const durationPct = traceDuration > 0 ? ((span.duration_ms ?? 0) / traceDuration * 100).toFixed(1) : '—';
          const kind = ((span.kind_string || span.span_kind) ?? '').toUpperCase();

          let borderLeft = 'none';
          let rowBg = 'transparent';
          if (isSelected) {
            borderLeft = '3px solid var(--literal-hex-5e60ce)';
            rowBg = 'var(--literal-rgba-94-96-206-0p15)';
          } else if (isError) {
            borderLeft = '3px solid #f04438';
            rowBg = 'rgba(240,68,56,0.06)';
          } else if (isCritical) {
            borderLeft = '3px solid #f59e0b';
            rowBg = 'rgba(245,158,11,0.06)';
          }

          return (
            <div
              key={span.span_id}
              className={`waterfall-row${isSelected ? ' selected' : ''}${hoveredSpanId === span.span_id ? ' hovered' : ''}`}
              style={{ borderLeft, background: rowBg }}
              onClick={() => onSpanClick && onSpanClick(span)}
              onMouseEnter={() => setHoveredSpanId(span.span_id)}
              onMouseLeave={() => setHoveredSpanId(null)}
            >
              {/* Label */}
              <div className="waterfall-labels-column" style={{ width: 300, minWidth: 300 }}>
                <div className="waterfall-span-label" style={{ paddingLeft: `${span.depth * 16 + 8}px` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    {kind && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          padding: '1px 4px',
                          borderRadius: 3,
                          background: `${kindColor(kind)}22`,
                          color: kindColor(kind),
                          flexShrink: 0,
                          lineHeight: '14px',
                        }}
                      >
                        {kind.slice(0, 3)}
                      </span>
                    )}
                    <span className="waterfall-service-name">{span.service_name}</span>
                  </div>
                  <span className="waterfall-operation-name">{span.operation_name}</span>
                </div>
              </div>

              {/* Duration % */}
              <div
                style={{
                  width: 60,
                  minWidth: 60,
                  borderRight: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  padding: '0 8px',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {durationPct}%
              </div>

              {/* Timeline bar */}
              <div className="waterfall-timeline-column">
                <div className="waterfall-bar-container">
                  <div
                    className="waterfall-bar"
                    style={getBarStyle(span, index)}
                    title={`${span.operation_name} — ${formatDuration(span.duration_ms)}`}
                  >
                    <span className="waterfall-bar-duration">{formatDuration(span.duration_ms)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
