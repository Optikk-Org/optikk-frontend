import { Row, Col, Spin, Empty, Tag, Table } from 'antd';
import { GitBranch, Layers, Clock, AlertCircle, ArrowLeft, FileText, X, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import WaterfallChart from '@components/charts/specialized/WaterfallChart';
import { ObservabilityDetailPanel } from '@/shared/components/data-board/ObservabilityDetailPanel';
import StatCard from '@components/common/cards/StatCard';
import PageHeader from '@components/common/layout/PageHeader';

import { useAppStore } from '@store/appStore';
import { formatDuration, formatTimestamp, formatNumber } from '@utils/formatters';
import { APP_COLORS } from '@config/colorLiterals';

import { useTraceDetailData } from '../../hooks/useTraceDetailData';
import './TraceDetailPage.css';

/**
 * Enterprise trace detail page with waterfall visualization and associated logs.
 */
export default function TraceDetailPage() {
  const { traceId } = useParams();
  const traceIdParam = traceId ?? '';
  const navigate = useNavigate();
  const selectedTeamId = useAppStore((state) => state.selectedTeamId);
  const [waterfallCollapsed, setWaterfallCollapsed] = useState(false);

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

  const handleSpanClick = (span: { span_id?: string }) => {
    setSelectedSpanId(span.span_id ?? null);
  };

  const handleCloseDrawer = () => {
    setSelectedSpanId(null);
  };

  const handleBackClick = () => {
    navigate('/traces');
  };

  const logColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 190,
      render: (value: unknown) => {
        try {
          if (
            typeof value === 'string' ||
            typeof value === 'number' ||
            value instanceof Date
          ) {
            return formatTimestamp(value);
          }
          return '-';
        } catch (e) {
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

  // Build fields for the detail panel
  const spanDetailFields = selectedSpan ? [
    { key: 'span_id', label: 'Span ID', value: selectedSpan.span_id },
    { key: 'parent_span_id', label: 'Parent Span ID', value: selectedSpan.parent_span_id || '—' },
    { key: 'service_name', label: 'Service', value: selectedSpan.service_name, filterable: true },
    { key: 'span_kind', label: 'Span Kind', value: selectedSpan.span_kind },
    { key: 'status', label: 'Status', value: selectedSpan.status || 'UNSET' },
    ...(selectedSpan.status_message ? [{ key: 'status_message', label: 'Status Message', value: selectedSpan.status_message }] : []),
    { key: 'start_time', label: 'Start Time', value: formatTimestamp(selectedSpan.start_time) },
    { key: 'end_time', label: 'End Time', value: formatTimestamp(selectedSpan.end_time) },
    { key: 'duration', label: 'Duration', value: formatDuration(selectedSpan.duration_ms) },
    { key: 'trace_id', label: 'Trace ID', value: selectedSpan.trace_id },
    ...(selectedSpan.http_method ? [
      { key: 'http_method', label: 'HTTP Method', value: selectedSpan.http_method },
      { key: 'http_url', label: 'HTTP URL', value: selectedSpan.http_url },
      { key: 'http_status_code', label: 'HTTP Status', value: String(selectedSpan.http_status_code) },
    ] : []),
    ...((selectedSpan).host ? [{ key: 'host', label: 'Host', value: (selectedSpan).host }] : []),
    ...((selectedSpan).pod ? [{ key: 'pod', label: 'Pod', value: (selectedSpan).pod }] : []),
  ].filter((f) => f.value && f.value !== '0') : [];

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
          <button className="trace-detail-back-btn" onClick={handleBackClick}>
            <ArrowLeft size={16} />
            Back to Traces
          </button>
        }
      />

      {selectedSpan && (
        <ObservabilityDetailPanel
          title="Span Detail"
          titleBadge={
            <Tag
              color={selectedSpan.status === 'ERROR' ? 'red' : selectedSpan.status === 'OK' ? 'green' : 'default'}
              style={{ marginLeft: 8, fontSize: 11 }}
            >
              {selectedSpan.status || 'UNSET'}
            </Tag>
          }
          metaLine={selectedSpan.operation_name}
          metaRight={formatDuration((selectedSpan).duration_ms)}
          fields={spanDetailFields}
          rawData={selectedSpan}
          onClose={handleCloseDrawer}
        />
      )}

      {isLoading ? (
        <div className="trace-detail-loading">
          <Spin size="large" />
        </div>
      ) : spans.length === 0 ? (
        <Empty description="No spans found for this trace" />
      ) : (
        <>
          {/* Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                metric={{
                  title: 'Total Spans',
                  value: stats.totalSpans,
                  formatter: formatNumber,
                }}
                visuals={{
                  icon: <Layers size={20} />,
                  iconColor: APP_COLORS.hex_5e60ce,
                }}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                metric={{
                  title: 'Duration',
                  value: stats.duration,
                  formatter: formatDuration,
                }}
                visuals={{
                  icon: <Clock size={20} />,
                  iconColor: APP_COLORS.hex_73c991,
                }}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                metric={{
                  title: 'Services',
                  value: stats.services.size,
                  formatter: formatNumber,
                }}
                visuals={{
                  icon: <GitBranch size={20} />,
                  iconColor: APP_COLORS.hex_06aed5,
                }}
              />
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatCard
                metric={{
                  title: 'Errors',
                  value: stats.errors,
                  formatter: formatNumber,
                }}
                visuals={{
                  icon: <AlertCircle size={20} />,
                  iconColor: stats.errors > 0 ? APP_COLORS.hex_f04438 : APP_COLORS.hex_73c991,
                }}
              />
            </Col>
          </Row>

          {/* Waterfall Chart */}
          <div
            className="glass-panel"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              borderRadius: '16px',
              border: '1px solid var(--glass-border)',
              padding: waterfallCollapsed ? '12px 24px' : '24px',
              boxShadow: 'var(--shadow-lg)',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: waterfallCollapsed ? 0 : '16px' }}>
              <span
                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: '16px' }}
                onClick={() => setWaterfallCollapsed((c) => !c)}
              >
                {waterfallCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                Trace Timeline
              </span>
              <button
                onClick={() => setWaterfallCollapsed((c) => !c)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
                title={waterfallCollapsed ? 'Expand waterfall' : 'Collapse waterfall'}
              >
                <X size={16} />
              </button>
            </div>
            {!waterfallCollapsed && (
              <WaterfallChart
                spans={spans}
                onSpanClick={handleSpanClick}
                selectedSpanId={selectedSpanId}
              />
            )}
          </div>

          {/* Associated Logs */}
          <div
            className="glass-panel"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur)',
              WebkitBackdropFilter: 'var(--glass-blur)',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)',
              padding: '20px 24px',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: '15px' }}>
              <FileText size={18} />
              <span>Associated Logs</span>
              {traceLogs.length > 0 && (
                <Tag color="default" style={{ marginLeft: 8, background: APP_COLORS.rgba_255_255_255_0p06_2, border: 'none', color: 'var(--text-secondary)' }}>
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
