import { Switch, Tooltip, Select } from 'antd';
import { GitBranch, GitBranch as TraceIcon, AlertCircle, Layers } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  PageHeader,
  ObservabilityQueryBar,
  ObservabilityDataBoard,
  ObservabilityDetailPanel,
  boardHeight,
} from '@components/common';
import ConfiguredTabPanel from '@components/dashboard/ConfiguredTabPanel';

import { type StructuredFilter } from '@hooks/useURLFilters';

import { formatTimestamp, formatDuration, formatNumber } from '@utils/formatters';
import { relativeTime } from '@utils/time';
import { TracesServicePills, TraceStatusBadge, TracesTableRow } from '../../components';

import type { TraceRecord } from '../../types';

import './TracesPage.css';

import { useTracesExplorer } from '../../hooks/useTracesExplorer';
import { TRACE_FILTER_FIELDS, TRACE_COLUMNS } from '../../utils/tracesUtils';
import { TracesKpiRow } from '../../components/TracesKpiRow';
import { TracesChartsRow } from '../../components/TracesChartsRow';

import { EntityExplorerLayout } from '@/shared/components/layout/EntityExplorerLayout';

export default function TracesPage(): JSX.Element {
  const navigate = useNavigate();
  const { isLoading, traces, totalTraces, errorRate, p95, p99, serviceBadges, maxDuration, searchText, selectedService, errorsOnly, page, pageSize, filters, setSearchText, setSelectedService, setErrorsOnly, setPage, setPageSize, setFilters, clearAll } = useTracesExplorer();
  const [selectedTrace, setSelectedTrace] = useState<TraceRecord | null>(null);

  const renderRow = useCallback(
    (
      trace: TraceRecord,
      context: { colWidths: Record<string, number>; visibleCols: Record<string, boolean> },
    ): JSX.Element => (
      <TracesTableRow
        trace={trace}
        colWidths={context.colWidths}
        visibleCols={context.visibleCols}
        maxDuration={maxDuration}
        columns={TRACE_COLUMNS}
        onRowClick={(spanId: string) => navigate(`/traces/${spanId}`)}
        onOpenDetail={setSelectedTrace}
      />
    ),
    [maxDuration, navigate],
  );

  const detailFields = selectedTrace
    ? [
        {
          key: 'trace_id',
          label: 'Trace ID',
          value: selectedTrace.trace_id,
          filterable: true,
        },
        {
          key: 'service_name',
          label: 'Service',
          value: selectedTrace.service_name,
          filterable: true,
        },
        {
          key: 'operation_name',
          label: 'Operation',
          value: selectedTrace.operation_name,
          filterable: false,
        },
        { key: 'status', label: 'Status', value: selectedTrace.status, filterable: true },
        {
          key: 'http_method',
          label: 'HTTP Method',
          value: selectedTrace.http_method,
          filterable: true,
        },
        {
          key: 'http_status_code',
          label: 'HTTP Status Code',
          value: selectedTrace.http_status_code ? String(selectedTrace.http_status_code) : null,
          filterable: false,
        },
        {
          key: 'duration_ms',
          label: 'Duration',
          value: formatDuration(selectedTrace.duration_ms),
          filterable: false,
        },
        {
          key: 'start_time',
          label: 'Start Time',
          value: selectedTrace.start_time,
          filterable: false,
        },
      ].filter((field) => Boolean(field.value))
    : [];

  const offset = (page - 1) * pageSize;

  return (
    <EntityExplorerLayout
      className="traces-page"
      header={<PageHeader title="Traces" icon={<GitBranch size={24} />} />}
      kpiRow={
        <TracesKpiRow
          totalTraces={totalTraces}
          errorRate={errorRate}
          p95={p95}
          p99={p99}
        />
      }
      chartsRow={
        <TracesChartsRow
          traces={traces}
          serviceBadges={serviceBadges}
          isLoading={isLoading}
        />
      }
      tabPanel={<ConfiguredTabPanel pageId="traces" tabId="default" />}
      tableSection={
        <div className="traces-table-card">
          <div className="traces-table-card-header">
            <span className="traces-table-card-title">
              <GitBranch size={15} />
              Trace Explorer
              <span className="traces-count-badge">
                {formatNumber(traces.length)} of {formatNumber(totalTraces)}
              </span>
            </span>
          </div>

          {serviceBadges.length > 0 && (
            <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--border-color)' }}>
              <TracesServicePills
                serviceBadges={serviceBadges}
                total={totalTraces}
                selectedService={selectedService}
                onSelect={(serviceName: string | null) => {
                  setSelectedService(serviceName);
                  setPage(1);
                }}
              />
            </div>
          )}

          <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--border-color)' }}>
            <ObservabilityQueryBar
              fields={TRACE_FILTER_FIELDS}
              filters={filters as StructuredFilter[]}
              setFilters={(nextFilters) => {
                setFilters(nextFilters as StructuredFilter[]);
                setPage(1);
              }}
              searchText={searchText}
              setSearchText={(value: string) => {
                setSearchText(value);
                setPage(1);
              }}
              onClearAll={clearAll}
              placeholder="Filter by trace ID, service, status, duration…"
              rightSlot={
                <Tooltip title="Show only traces with errors">
                  <div
                    className={`traces-errors-toggle ${errorsOnly ? 'active' : ''}`}
                    onClick={() => {
                      setErrorsOnly(!errorsOnly);
                      setPage(1);
                    }}
                  >
                    <AlertCircle size={13} />
                    Errors only
                    <Switch
                      size="small"
                      checked={errorsOnly}
                      onChange={(checked: boolean) => {
                        setErrorsOnly(checked);
                        setPage(1);
                      }}
                      onClick={(_, event) => event.stopPropagation()}
                    />
                  </div>
                </Tooltip>
              }
            />
          </div>

          <div style={{ height: boardHeight(pageSize), display: 'flex', flexDirection: 'column' }}>
            <ObservabilityDataBoard
              data={{ rows: traces, isLoading, serverTotal: totalTraces }}
              config={{
                columns: TRACE_COLUMNS,
                rowKey: (trace, index) => trace.trace_id || index,
                renderRow,
                entityName: 'trace',
                storageKey: 'traces_visible_cols_v2',
                emptyTips: [
                  { num: 1, text: <>Widen the <strong>time range</strong> in the top bar</> },
                  { num: 2, text: <>Remove active <strong>filters</strong> from the query bar</> },
                  { num: 3, text: <>Ensure your services are sending traces via <strong>OTLP</strong></> },
                ]
              }}
            />
          </div>

          {!isLoading && totalTraces > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 18px',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Showing {offset + 1}–{Math.min(offset + pageSize, totalTraces)} of{' '}
                {formatNumber(totalTraces)}
              </span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <Select
                  size="small"
                  value={pageSize}
                  onChange={(value: number) => {
                    setPageSize(value);
                    setPage(1);
                  }}
                  options={[10, 20, 50, 100].map((value) => ({
                    label: `${value} / page`,
                    value,
                  }))}
                  style={{ width: 110 }}
                />
                <button
                  className="traces-export-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((previousPage) => Math.max(1, previousPage - 1))}
                  style={{ opacity: page <= 1 ? 0.4 : 1 }}
                >
                  ← Prev
                </button>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '0 4px' }}>
                  Page {page} of {Math.max(1, Math.ceil((totalTraces) / pageSize))}
                </span>
                <button
                  className="traces-export-btn"
                  disabled={page >= Math.ceil((totalTraces) / pageSize)}
                  onClick={() => setPage((previousPage) => previousPage + 1)}
                  style={{
                    opacity: page >= Math.ceil((totalTraces) / pageSize) ? 0.4 : 1,
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      }
      detailSidebar={
        selectedTrace && (
          <ObservabilityDetailPanel
            title="Trace Detail"
            titleBadge={<TraceStatusBadge status={selectedTrace.status} />}
            metaLine={selectedTrace.start_time ? formatTimestamp(selectedTrace.start_time) : undefined}
            metaRight={selectedTrace.start_time ? relativeTime(selectedTrace.start_time) : undefined}
            summaryNode={
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span
                  style={{
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    fontSize: 12.5,
                  }}
                >
                  {selectedTrace.operation_name}
                </span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {selectedTrace.http_method && (
                    <span className={`traces-method-badge ${selectedTrace.http_method.toUpperCase()}`}>
                      {selectedTrace.http_method.toUpperCase()}
                    </span>
                  )}
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                    {formatDuration(selectedTrace.duration_ms)}
                  </span>
                </div>
              </div>
            }
            actions={
              <>
                <button
                  className="oboard__detail-action-btn oboard__detail-action-btn--primary"
                  onClick={() => {
                    navigate(`/traces/${selectedTrace.span_id || selectedTrace.trace_id}`);
                    setSelectedTrace(null);
                  }}
                >
                  <TraceIcon size={13} /> View Full Trace
                </button>
                <button
                  className="oboard__detail-action-btn"
                  onClick={() => {
                    navigate(`/traces/${selectedTrace.span_id || selectedTrace.trace_id}`);
                    setSelectedTrace(null);
                  }}
                >
                  <Layers size={13} /> Waterfall
                </button>
              </>
            }
            fields={detailFields}
            rawData={selectedTrace}
            onClose={() => setSelectedTrace(null)}
          />
        )
      }
    />
  );
}
