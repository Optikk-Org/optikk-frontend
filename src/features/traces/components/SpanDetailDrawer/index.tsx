import { useState } from 'react';
import { Tabs, Tag, Table, Spin, Empty, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { formatDuration, formatTimestamp } from '@shared/utils/formatters';
import type { SpanAttributes, SpanEvent, SpanSelfTime, RelatedTrace } from '../../types';

const STATUS_COLOR: Record<string, string> = {
  ERROR: 'red',
  OK: 'green',
  UNSET: 'default',
};

// ── Attributes Tab ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function KVRow({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: 8, padding: '4px 0', borderBottom: '1px solid var(--glass-border)', fontSize: 13 }}>
      <span style={{ width: 160, flexShrink: 0, color: 'var(--text-muted)', fontSize: 12 }}>{label}</span>
      <span style={{ fontFamily: mono ? 'monospace' : undefined, wordBreak: 'break-all', color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

function AttributesTab({ attrs, loading }: { attrs: SpanAttributes | null; loading: boolean }) {
  const [attrSearch, setAttrSearch] = useState('');
  if (loading) return <div style={{ padding: 32, textAlign: 'center' }}><Spin /></div>;
  if (!attrs) return <Empty description="Select a span to view attributes" image={Empty.PRESENTED_IMAGE_SIMPLE} />;

  const allAttrs = { ...attrs.attributes };

  const filteredAttrs = Object.entries(allAttrs).filter(
    ([k, v]) =>
      attrSearch === '' ||
      k.toLowerCase().includes(attrSearch.toLowerCase()) ||
      (v ?? '').toLowerCase().includes(attrSearch.toLowerCase()),
  );

  const hasHTTP = attrs.attributesString?.['http.method'] || attrs.attributesString?.['http.url'] || attrs.attributesString?.['http.status_code'];
  const hasDB = attrs.dbSystem || attrs.dbName || attrs.dbStatement;
  const hasRPC = attrs.attributesString?.['rpc.system'] || attrs.attributesString?.['rpc.service'];

  return (
    <div>
      <Section title="Core">
        <KVRow label="Span ID" value={attrs.spanId} mono />
        <KVRow label="Trace ID" value={attrs.traceId} mono />
        <KVRow label="Service" value={attrs.serviceName} />
        <KVRow label="Operation" value={attrs.operationName} />
      </Section>

      {attrs.exceptionType && (
        <Section title="Exception">
          <KVRow label="Type" value={attrs.exceptionType} />
          <KVRow label="Message" value={attrs.exceptionMessage} />
          {attrs.exceptionStacktrace && (
            <pre
              style={{
                marginTop: 8,
                background: 'rgba(240,68,56,0.06)',
                border: '1px solid rgba(240,68,56,0.2)',
                borderRadius: 6,
                padding: '10px 12px',
                fontSize: 11,
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: '#f04438',
                maxHeight: 240,
              }}
            >
              {attrs.exceptionStacktrace}
            </pre>
          )}
        </Section>
      )}

      {hasHTTP && (
        <Section title="HTTP">
          <KVRow label="Method" value={attrs.attributesString?.['http.method']} />
          <KVRow label="URL" value={attrs.attributesString?.['http.url'] || attrs.attributesString?.['url.full']} mono />
          <KVRow label="Status Code" value={attrs.attributesString?.['http.status_code'] || attrs.attributesString?.['http.response.status_code']} />
          <KVRow label="Route" value={attrs.attributesString?.['http.route']} />
        </Section>
      )}

      {hasDB && (
        <Section title="Database">
          <KVRow label="System" value={attrs.dbSystem} />
          <KVRow label="Database" value={attrs.dbName} />
          <KVRow label="Operation" value={attrs.attributesString?.['db.operation']} />
          {attrs.dbStatement && (
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Statement</div>
              <pre
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 12,
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  maxHeight: 160,
                  margin: 0,
                }}
              >
                {attrs.dbStatement}
              </pre>
            </div>
          )}
          {attrs.dbStatementNormalized && attrs.dbStatementNormalized !== attrs.dbStatement && (
            <div style={{ marginTop: 6 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Normalized</div>
              <pre
                style={{
                  background: 'rgba(100,143,255,0.06)',
                  border: '1px solid rgba(100,143,255,0.2)',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 12,
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  maxHeight: 100,
                  margin: 0,
                }}
              >
                {attrs.dbStatementNormalized}
              </pre>
            </div>
          )}
        </Section>
      )}

      {hasRPC && (
        <Section title="RPC">
          <KVRow label="System" value={attrs.attributesString?.['rpc.system']} />
          <KVRow label="Service" value={attrs.attributesString?.['rpc.service']} />
          <KVRow label="Method" value={attrs.attributesString?.['rpc.method']} />
          <KVRow label="gRPC Status" value={attrs.attributesString?.['rpc.grpc.status_code']} />
        </Section>
      )}

      {Object.keys(attrs.resourceAttributes ?? {}).length > 0 && (
        <Section title="Resource Attributes">
          {Object.entries(attrs.resourceAttributes).map(([k, v]) => (
            <KVRow key={k} label={k} value={v} mono />
          ))}
        </Section>
      )}

      <Section title="All Attributes">
        <Input
          placeholder="Search attributes..."
          value={attrSearch}
          onChange={(e) => setAttrSearch(e.target.value)}
          style={{ marginBottom: 8 }}
          size="small"
          allowClear
        />
        <Table
          size="small"
          pagination={false}
          scroll={{ y: 240 }}
          dataSource={filteredAttrs.map(([k, v]) => ({ key: k, value: v }))}
          rowKey="key"
          columns={[
            { title: 'Key', dataIndex: 'key', width: 220, render: (v: string) => <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{v}</span> },
            { title: 'Value', dataIndex: 'value', render: (v: string) => <span style={{ fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-all' }}>{v}</span> },
          ]}
        />
      </Section>
    </div>
  );
}

// ── Events Tab ─────────────────────────────────────────────────────────────────

function EventsTab({ events, selectedSpanId }: { events: SpanEvent[]; selectedSpanId: string | null }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const spanEvents = events.filter((e) => !selectedSpanId || e.spanId === selectedSpanId);

  if (spanEvents.length === 0) {
    return <Empty description="No events recorded for this span" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {spanEvents.map((ev, idx) => {
        const key = `${ev.spanId}-${idx}`;
        const isException = ev.eventName === 'exception';
        let parsed: Record<string, string> = {};
        try { parsed = JSON.parse(ev.attributes); } catch { /* empty */ }
        const isExpanded = expanded.has(key);

        return (
          <div
            key={key}
            style={{
              border: `1px solid ${isException ? 'rgba(240,68,56,0.3)' : 'var(--glass-border)'}`,
              borderRadius: 8,
              padding: '8px 12px',
              background: isException ? 'rgba(240,68,56,0.04)' : 'var(--glass-bg)',
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: isException ? 'pointer' : 'default' }}
              onClick={() => {
                if (!isException) return;
                setExpanded((prev) => {
                  const next = new Set(prev);
                  if (next.has(key)) {
                    next.delete(key);
                  } else {
                    next.add(key);
                  }
                  return next;
                });
              }}
            >
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                {formatTimestamp(ev.timestamp)}
              </span>
              <Tag color={isException ? 'red' : 'default'} style={{ margin: 0 }}>
                {ev.eventName}
              </Tag>
              {parsed['exception.type'] && (
                <span style={{ fontSize: 12, color: '#f04438', fontWeight: 500 }}>{parsed['exception.type']}</span>
              )}
              {isException && (
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
                  {isExpanded ? '▲' : '▼'}
                </span>
              )}
            </div>

            {isException && isExpanded && (
              <div style={{ marginTop: 8 }}>
                {parsed['exception.message'] && (
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{parsed['exception.message']}</div>
                )}
                {parsed['exception.stacktrace'] && (
                  <pre style={{
                    background: 'rgba(0,0,0,0.15)',
                    borderRadius: 6,
                    padding: '8px 10px',
                    fontSize: 11,
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: 300,
                    color: '#f04438',
                    margin: 0,
                  }}>
                    {parsed['exception.stacktrace']}
                  </pre>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Self-Time Tab ──────────────────────────────────────────────────────────────

function SelfTimeTab({ selfTimes }: { selfTimes: SpanSelfTime[] }) {
  if (selfTimes.length === 0) {
    return <Empty description="No self-time data available" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }
  const top20 = [...selfTimes].sort((a, b) => b.selfTimeMs - a.selfTimeMs).slice(0, 20);
  const maxTotal = Math.max(...top20.map((s) => s.totalDurationMs), 1);

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {top20.map((s) => {
          const selfPct = s.totalDurationMs > 0 ? (s.selfTimeMs / s.totalDurationMs) * 100 : 0;
          const childPct = 100 - selfPct;
          const barWidth = s.totalDurationMs / maxTotal;
          return (
            <div key={s.spanId}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 3 }}>
                <span style={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                  {s.operationName}
                </span>
                <span>{formatDuration(s.selfTimeMs)} self</span>
              </div>
              <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', width: `${barWidth * 100}%`, minWidth: 4, background: '#374151' }}>
                <div style={{ flex: selfPct, background: '#f97316', minWidth: selfPct > 0 ? 2 : 0 }} />
                <div style={{ flex: childPct, background: '#4b5563', minWidth: childPct > 0 ? 2 : 0 }} />
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
        <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#f97316', marginRight: 4 }} />Self time</span>
        <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#4b5563', marginRight: 4 }} />Child time</span>
      </div>
      <Table
        size="small"
        dataSource={top20}
        rowKey="spanId"
        pagination={false}
        scroll={{ y: 200 }}
        columns={[
          { title: 'Operation', dataIndex: 'operationName', ellipsis: true, render: (v: string) => <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{v}</span> },
          { title: 'Total', dataIndex: 'totalDurationMs', width: 80, render: (v: number) => formatDuration(v) },
          { title: 'Self', dataIndex: 'selfTimeMs', width: 80, render: (v: number) => formatDuration(v) },
          { title: 'Children', dataIndex: 'childTimeMs', width: 80, render: (v: number) => formatDuration(v) },
          {
            title: 'Self %',
            dataIndex: 'selfTimeMs',
            width: 70,
            render: (v: number, row: SpanSelfTime) =>
              row.totalDurationMs > 0 ? `${((v / row.totalDurationMs) * 100).toFixed(1)}%` : '—',
          },
        ]}
      />
    </div>
  );
}

// ── Related Traces Tab ─────────────────────────────────────────────────────────

function RelatedTab({ traces }: { traces: RelatedTrace[] }) {
  const navigate = useNavigate();
  if (traces.length === 0) {
    return <Empty description="No related traces found" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }
  return (
    <Table
      size="small"
      dataSource={traces}
      rowKey="traceId"
      pagination={false}
      scroll={{ y: 360 }}
      onRow={(row) => ({ onClick: () => navigate(`/traces/${row.traceId}`), style: { cursor: 'pointer' } })}
      columns={[
        {
          title: 'Trace ID',
          dataIndex: 'traceId',
          render: (v: string) => (
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--color-primary)' }}>{v.slice(0, 16)}…</span>
          ),
        },
        {
          title: 'Status',
          dataIndex: 'status',
          width: 80,
          render: (v: string) => <Tag color={STATUS_COLOR[v] ?? 'default'}>{v || 'UNSET'}</Tag>,
        },
        { title: 'Duration', dataIndex: 'durationMs', width: 90, render: (v: number) => formatDuration(v) },
        { title: 'Start', dataIndex: 'startTime', render: (v: string) => formatTimestamp(v) },
      ]}
    />
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface Props {
  selectedSpanId: string | null;
  selectedSpan: { operation_name?: string; status?: string; duration_ms?: number } | null;
  spanAttributes: SpanAttributes | null;
  spanAttributesLoading: boolean;
  spanEvents: SpanEvent[];
  spanSelfTimes: SpanSelfTime[];
  relatedTraces: RelatedTrace[];
}

export default function SpanDetailDrawer({
  selectedSpanId,
  selectedSpan,
  spanAttributes,
  spanAttributesLoading,
  spanEvents,
  spanSelfTimes,
  relatedTraces,
}: Props) {
  if (!selectedSpanId) return null;

  return (
    <div
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderRadius: '12px',
        border: '1px solid var(--glass-border)',
        padding: '16px 20px',
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedSpan?.operation_name || 'Span Detail'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <Tag color={STATUS_COLOR[selectedSpan?.status ?? ''] ?? 'default'} style={{ margin: 0 }}>
              {selectedSpan?.status || 'UNSET'}
            </Tag>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {selectedSpan?.duration_ms != null ? formatDuration(selectedSpan.duration_ms) : ''}
            </span>
          </div>
        </div>
      </div>

      <Tabs
        size="small"
        items={[
          {
            key: 'attributes',
            label: 'Attributes',
            children: <AttributesTab attrs={spanAttributes} loading={spanAttributesLoading} />,
          },
          {
            key: 'events',
            label: `Events${spanEvents.filter((e) => e.spanId === selectedSpanId).length > 0 ? ` (${spanEvents.filter((e) => e.spanId === selectedSpanId).length})` : ''}`,
            children: <EventsTab events={spanEvents} selectedSpanId={selectedSpanId} />,
          },
          {
            key: 'selftime',
            label: 'Self-Time',
            children: <SelfTimeTab selfTimes={spanSelfTimes} />,
          },
          {
            key: 'related',
            label: `Related${relatedTraces.length > 0 ? ` (${relatedTraces.length})` : ''}`,
            children: <RelatedTab traces={relatedTraces} />,
          },
        ]}
      />
    </div>
  );
}
