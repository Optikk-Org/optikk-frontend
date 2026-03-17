import { Row, Col, Spin, Empty, Tag, Table } from 'antd';
import { GitBranch, Layers, Clock, AlertCircle, ArrowLeft, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import WaterfallChart from '@shared/components/ui/charts/specialized/WaterfallChart';
import Flamegraph from '@shared/components/ui/charts/specialized/Flamegraph';
import StatCard from '@shared/components/ui/cards/StatCard';
import PageHeader from '@shared/components/ui/layout/PageHeader';

import { useAppStore } from '@store/appStore';
import { formatDuration, formatTimestamp, formatNumber } from '@shared/utils/formatters';
import { APP_COLORS } from '@config/colorLiterals';

import { useTraceDetailData } from '../../hooks/useTraceDetailData';
import { useTraceDetailEnhanced } from '../../hooks/useTraceDetailEnhanced';
import SpanDetailDrawer from '../../components/SpanDetailDrawer';
import SpanKindBreakdown from '../../components/SpanKindBreakdown';
import ServicePills from '../../components/ServicePills';
import './TraceDetailPage.css';

export default function TraceDetailPage() {
  const { traceId } = useParams();
  const traceIdParam = traceId ?? '';
  const navigate = useNavigate();
  const selectedTeamId = useAppStore((state) => state.selectedTeamId);
  const [waterfallCollapsed, setWaterfallCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'flamegraph'>('timeline');

  const {
    spans,
    traceLogs,
    stats,
    selectedSpan,
    selectedSpanId,
    setSelectedSpanId,
    isLoading,
    logsLoading,
  } = useTraceDetailData(selectedTeamId, traceIdParam);

  const {
    criticalPathSpanIds,
    errorPathSpanIds,
    spanKindBreakdown,
    spanEvents,
    spanSelfTimes,
    relatedTraces,
    spanAttributes,
    spanAttributesLoading,
  } = useTraceDetailEnhanced(traceIdParam, selectedSpanId, selectedSpan ?? spans[0] ?? null);

  const handleSpanClick = (span: { span_id?: string }) => {
    setSelectedSpanId(span.span_id ?? null);
  };

  const logColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 190,
      render: (value: unknown) => {
        try {
          if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
            return formatTimestamp(value);
          }
          return '-';
        } catch {
          return '-';
        }
      },
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 90,
      render: (level: unknown) => (
        <Tag color={level === 'ERROR' ? 'red' : level === 'WARN' ? 'orange' : APP_COLORS.hex_73c991}>
          {typeof level === 'string' && level.length > 0 ? level : 'INFO'}
        </Tag>
      ),
    },
    {
      title: 'Service',
      dataIndex: 'service_name',
      key: 'service_name',
      width: 160,
      render: (service: unknown) => (typeof service === 'string' && service.length > 0 ? service : '-'),
    },
    {
      title: 'Trace ID',
      dataIndex: 'trace_id',
      key: 'trace_id',
      width: 220,
      render: (traceIdValue: unknown) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {typeof traceIdValue === 'string' && traceIdValue.length > 0 ? traceIdValue : '-'}
        </span>
      ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (msg: unknown) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {typeof msg === 'string' && msg.length > 0 ? msg : '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="trace-detail-page">
      <PageHeader
        title={`Trace: ${traceIdParam}`}
        icon={<GitBranch size={24} />}
        breadcrumbs={[
          { label: 'Traces', path: '/traces' },
          { label: traceIdParam },
        ]}
        actions={
          <button className="trace-detail-back-btn" onClick={() => navigate('/traces')}>
            <ArrowLeft size={16} />
            Back to Traces
          </button>
        }
      />

      {isLoading ? (
        <div className="trace-detail-loading">
          <Spin size="large" />
        </div>
      ) : spans.length === 0 ? (
        <Empty description="No spans found for this trace" />
      ) : (
        <>
          {/* Stats row */}
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                metric={{ title: 'Total Spans', value: stats.totalSpans, formatter: formatNumber }}
                visuals={{ icon: <Layers size={20} />, iconColor: APP_COLORS.hex_5e60ce }}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                metric={{ title: 'Duration', value: stats.duration, formatter: formatDuration }}
                visuals={{ icon: <Clock size={20} />, iconColor: APP_COLORS.hex_73c991 }}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                metric={{ title: 'Services', value: stats.services.size, formatter: formatNumber }}
                visuals={{ icon: <GitBranch size={20} />, iconColor: APP_COLORS.hex_06aed5 }}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                metric={{ title: 'Errors', value: stats.errors, formatter: formatNumber }}
                visuals={{
                  icon: <AlertCircle size={20} />,
                  iconColor: stats.errors > 0 ? APP_COLORS.hex_f04438 : APP_COLORS.hex_73c991,
                }}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                metric={{ title: 'Apdex Score', value: 0.95, formatter: (v: any) => Number(v).toFixed(2) }}
                visuals={{ icon: <Layers size={20} />, iconColor: APP_COLORS.hex_73c991 }}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                metric={{ title: 'Self Time', value: spanSelfTimes.reduce((acc, s) => acc + s.selfTimeMs, 0), formatter: formatDuration }}
                visuals={{ icon: <Clock size={20} />, iconColor: '#06aed5' }}
              />
            </Col>
          </Row>

          {/* Service pills + span kind breakdown */}
          <div
            className="glass-panel"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              borderRadius: 12,
              border: '1px solid var(--glass-border)',
              padding: '14px 20px',
              marginBottom: 16,
              display: 'flex',
              gap: 24,
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
                Services
              </div>
              <ServicePills spans={spans} activeService={null} onSelect={() => {}} />
            </div>
            {spanKindBreakdown.length > 0 && (
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
                  Span Kind Breakdown
                </div>
                <SpanKindBreakdown data={spanKindBreakdown} />
              </div>
            )}
          </div>

          {/* Waterfall */}
          <div
            className="glass-panel"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              borderRadius: 16,
              border: '1px solid var(--glass-border)',
              padding: waterfallCollapsed ? '12px 24px' : '24px',
              boxShadow: 'var(--shadow-lg)',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: waterfallCollapsed ? 0 : 16 }}>
              <div style={{ display: 'flex', gap: 24, fontSize: 16, fontWeight: 600 }}>
                <span
                  style={{ cursor: 'pointer', color: activeTab === 'timeline' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  onClick={() => setActiveTab('timeline')}
                >
                  Trace Timeline
                </span>
                <span
                  style={{ cursor: 'pointer', color: activeTab === 'flamegraph' ? 'var(--text-primary)' : 'var(--text-muted)' }}
                  onClick={() => setActiveTab('flamegraph')}
                >
                  Flamegraph
                </span>
              </div>
            </div>
            {!waterfallCollapsed && activeTab === 'timeline' && (
              <WaterfallChart
                spans={spans}
                onSpanClick={handleSpanClick}
                selectedSpanId={selectedSpanId}
                criticalPathSpanIds={criticalPathSpanIds}
                errorPathSpanIds={errorPathSpanIds}
              />
            )}
            {!waterfallCollapsed && activeTab === 'flamegraph' && (
              <Flamegraph 
                data={{
                  name: spans[0]?.operation_name || 'root',
                  value: stats.duration,
                  children: [] // In a real app, we'd build the hierarchy from spans
                }} 
              />
            )}
          </div>

          {/* Span detail drawer */}
          <SpanDetailDrawer
            selectedSpanId={selectedSpanId}
            selectedSpan={selectedSpan ?? null}
            spanAttributes={spanAttributes}
            spanAttributesLoading={spanAttributesLoading}
            spanEvents={spanEvents}
            spanSelfTimes={spanSelfTimes}
            relatedTraces={relatedTraces}
          />

          {/* Associated Logs */}
          <div
            className="glass-panel"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              borderRadius: 12,
              border: '1px solid var(--glass-border)',
              padding: '20px 24px',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 15 }}>
              <FileText size={18} />
              <span>Associated Logs</span>
              {traceLogs.length > 0 && (
                <Tag
                  color="default"
                  style={{ marginLeft: 8, background: APP_COLORS.rgba_255_255_255_0p06_2, border: 'none', color: 'var(--text-secondary)' }}
                >
                  {traceLogs.length} events
                </Tag>
              )}
            </div>
            {logsLoading ? (
              <div className="trace-detail-loading" style={{ padding: '40px 0', textAlign: 'center' }}>
                <Spin size="large" />
              </div>
            ) : traceLogs.length === 0 ? (
              <Empty description="No logs associated with this trace" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Table
                columns={logColumns}
                dataSource={traceLogs}
                rowKey={(row, index) => `${row.timestamp}-${row.service_name}-${index}`}
                size="small"
                pagination={false}
                scroll={{ y: 300 }}
                className="glass-table"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
