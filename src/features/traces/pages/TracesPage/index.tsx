import { Pagination, Switch, Tooltip } from '@shared/design-system';
import { GitBranch, GitBranch as TraceIcon, AlertCircle, Layers, GitCompare, Radio } from 'lucide-react';
import { useState, useCallback, useEffect, type ChangeEvent, type MouseEvent as ReactMouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  PageHeader,
  ObservabilityQueryBar,
  ObservabilityDataBoard,
  ObservabilityDetailPanel,
  boardHeight,
} from '@shared/components/ui';

import { type StructuredFilter } from '@shared/hooks/useURLFilters';
import { formatTimestamp, formatDuration, formatNumber } from '@shared/utils/formatters';
import { relativeTime } from '@shared/utils/time';
import { TracesServicePills, TraceStatusBadge, TracesTableRow } from '../../components';
import { tracesService } from '@shared/api/tracesService';

import type { TraceRecord } from '../../types';
import './TracesPage.css';

import { useTracesExplorer } from '../../hooks/useTracesExplorer';
import { useTraceDetailFields } from '../../hooks/useTraceDetailFields';
import { TRACE_FILTER_FIELDS, TRACE_COLUMNS } from '../../utils/tracesUtils';
import { EntityExplorerLayout } from '@/shared/components/layout/EntityExplorerLayout';

export default function TracesPage(): JSX.Element {
  const navigate = useNavigate();
  const { 
    isLoading, 
    traces, 
    totalTraces, 
    serviceBadges, 
    maxDuration, 
    searchText, 
    selectedService, 
    errorsOnly, 
    page, 
    pageSize, 
    filters, 
    setSearchText, 
    setSelectedService, 
    setErrorsOnly, 
    setPage, 
    setPageSize, 
    setFilters, 
    clearAll 
  } = useTracesExplorer();
  
  const [selectedTrace, setSelectedTrace] = useState<TraceRecord | null>(null);
  const [selectedTraceIds, setSelectedTraceIds] = useState<string[]>([]);
  const [isLiveTail, setIsLiveTail] = useState(false);
  const [activeView, setActiveView] = useState<'explorer' | 'analytics'>('explorer');
  
  const detailFields = useTraceDetailFields(selectedTrace);

  const handleSelectTrace = useCallback((traceId: string, selected: boolean) => {
    setSelectedTraceIds(prev => {
      if (selected) {
        if (prev.length >= 2) return prev;
        return [...prev, traceId];
      }
      return prev.filter(id => id !== traceId);
    });
  }, []);

  useEffect(() => {
    if (!isLiveTail) return;

    const url = tracesService.getLiveTailUrl(filters as any);
    const eventSource = new EventSource(url);

    eventSource.addEventListener('spans', (event) => {
      console.log('Live spans:', JSON.parse(event.data));
    });

    return () => eventSource.close();
  }, [isLiveTail, filters]);

  const onRowClick = useCallback((spanId: string) => {
    navigate(`/traces/${spanId}`);
  }, [navigate]);

  const offset = (page - 1) * pageSize;

  return (
    <EntityExplorerLayout
      className="traces-page"
      header={<PageHeader title="Traces" icon={<GitBranch size={24} />} />}
      tabPanel={
        <div className="flex gap-md">
          <div
            className={`explorer-tab ${activeView === 'explorer' ? 'active' : ''}`}
            onClick={() => setActiveView('explorer')}
          >
            Trace Explorer
          </div>
        </div>
      }
      tableSection={
        (
          <div className="traces-table-card">
            <div className="traces-table-card-header">
              <span className="traces-table-card-title">
                <GitBranch size={15} />
                Trace Explorer
                <span className="traces-count-badge">
                  {formatNumber(traces.length)} of {formatNumber(totalTraces)}
                </span>
              </span>
              <div className="flex items-center gap-sm">
                {selectedTraceIds.length === 2 && (
                  <button 
                    className="traces-compare-btn"
                    onClick={() => navigate(`/traces/compare?a=${selectedTraceIds[0]}&b=${selectedTraceIds[1]}`)}
                  >
                    <GitCompare size={14} /> Compare Selected
                  </button>
                )}
                <div 
                  className={`live-tail-toggle ${isLiveTail ? 'active' : ''}`}
                  onClick={() => setIsLiveTail(!isLiveTail)}
                >
                  <Radio size={14} className={isLiveTail ? 'pulse-icon' : ''} />
                  Live Tail
                </div>
              </div>
            </div>

            {serviceBadges.length > 0 && (
              <div className="px-md py-xs border-b">
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

            <div className="px-md py-xs border-b">
              <ObservabilityQueryBar
                fields={TRACE_FILTER_FIELDS}
                filters={filters as StructuredFilter[]}
                setFilters={(nextFilters: StructuredFilter[]) => {
                  setFilters(nextFilters);
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
                  <Tooltip content="Show only traces with errors">
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
                        size="sm"
                        checked={errorsOnly}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          setErrorsOnly(e.target.checked);
                          setPage(1);
                        }}
                        onClick={(e: ReactMouseEvent<HTMLInputElement>) => e.stopPropagation()}
                      />
                    </div>
                  </Tooltip>
                }
              />
            </div>

            <div className="flex-col" style={{ height: boardHeight(pageSize) }}>
              <ObservabilityDataBoard
                data={{ rows: traces, isLoading, serverTotal: totalTraces }}
                config={{
                  columns: TRACE_COLUMNS,
                  rowKey: (trace, index) => trace['trace_id'] || index,
                  renderRow: (trace, context) => (
                    <TracesTableRow
                      trace={trace}
                      colWidths={context.colWidths}
                      visibleCols={context.visibleCols}
                      maxDuration={maxDuration}
                      columns={TRACE_COLUMNS}
                      onRowClick={onRowClick}
                      onOpenDetail={setSelectedTrace}
                      isSelected={selectedTraceIds.includes(trace.trace_id)}
                      onSelect={handleSelectTrace}
                    />
                  ),
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
              <Pagination
                page={page}
                pageSize={pageSize}
                total={totalTraces}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
                pageSizeOptions={[10, 20, 50, 100]}
              />
            )}
          </div>
        )
      }
      detailSidebar={
        selectedTrace && (
          <ObservabilityDetailPanel
            title="Trace Detail"
            titleBadge={<TraceStatusBadge status={selectedTrace['status']} />}
            metaLine={selectedTrace['start_time'] ? formatTimestamp(selectedTrace['start_time'] as string) : ''}
            metaRight={selectedTrace['start_time'] ? relativeTime(selectedTrace['start_time'] as string) : ''}
            summaryNode={
              <div className="flex-col gap-2xs">
                <span className="font-semibold text-primary text-sm">
                  {selectedTrace['operation_name'] as string}
                </span>
                <div className="flex items-center gap-xs">
                  {selectedTrace['http_method'] && (
                    <span className={`traces-method-badge ${(selectedTrace['http_method'] as string).toUpperCase()}`}>
                      {(selectedTrace['http_method'] as string).toUpperCase()}
                    </span>
                  )}
                  <span className="text-xs text-muted">
                    {formatDuration(selectedTrace['duration_ms'] as number)}
                  </span>
                </div>
              </div>
            }
            actions={
              <>
                <button
                  className="oboard__detail-action-btn oboard__detail-action-btn--primary"
                  onClick={() => {
                    navigate(`/traces/${(selectedTrace['span_id'] as string) || (selectedTrace['trace_id'] as string)}`);
                    setSelectedTrace(null);
                  }}
                >
                  <TraceIcon size={13} /> View Full Trace
                </button>
                <button
                  className="oboard__detail-action-btn"
                  onClick={() => {
                    navigate(`/traces/${(selectedTrace['span_id'] as string) || (selectedTrace['trace_id'] as string)}`);
                    setSelectedTrace(null);
                  }}
                >
                  <Layers size={13} /> Waterfall
                </button>
              </>
            }
            fields={detailFields}
            rawData={selectedTrace as any}
            onClose={() => setSelectedTrace(null)}
          />
        )
      }
    />
  );
}
