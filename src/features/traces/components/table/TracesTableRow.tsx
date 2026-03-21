import React from 'react';
import { ArrowUpRight } from 'lucide-react';

import { formatDuration, formatTimestamp } from '@shared/utils/formatters';

import { APP_COLORS } from '@config/colorLiterals';

import TraceMethodBadge from './TraceMethodBadge';
import TraceStatusBadge from './TraceStatusBadge';

import type { TraceColumn, TraceRecord } from '../../types';
import type { ReactNode } from 'react';

interface TracesTableRowProps {
  trace: TraceRecord;
  colWidths: Record<string, number>;
  visibleCols: Record<string, boolean>;
  maxDuration: number;
  columns: TraceColumn[];
  onRowClick: (spanId: string) => void;
  onOpenDetail: (trace: TraceRecord) => void;
  isSelected?: boolean;
  onSelect?: (traceId: string, selected: boolean) => void;
}

/**
 * Row renderer for traces in ObservabilityDataBoard.
 */
export const TracesTableRow = React.memo(function TracesTableRow({
  trace,
  colWidths,
  visibleCols,
  maxDuration,
  columns,
  onRowClick,
  onOpenDetail,
  isSelected = false,
  onSelect,
}: TracesTableRowProps): JSX.Element {
  const fixedColumns = columns.filter((column) => !column.flex && visibleCols[column.key]);
  const flexColumn = columns.find((column) => column.flex && visibleCols[column.key]);

  const renderCell = (columnKey: string): ReactNode => {
    switch (columnKey) {
      case 'trace_id':
        return (
          <span
            className="traces-trace-id"
            onClick={(event) => {
              event.stopPropagation();
              onRowClick(trace.span_id || trace.trace_id);
            }}
            title={trace.trace_id}
          >
            <ArrowUpRight size={11} />
            {trace.trace_id ? `${trace.trace_id.slice(0, 16)}…` : '—'}
          </span>
        );
      case 'service_name':
        return (
          <span className="traces-service-tag">
            <span className="traces-service-tag-dot" />
            {trace.service_name || '—'}
          </span>
        );
      case 'status':
        return <TraceStatusBadge status={trace.status} />;
      case 'duration_ms': {
        const percentage =
          maxDuration > 0 ? Math.min((trace.duration_ms / maxDuration) * 100, 100) : 0;
        const color =
          trace.duration_ms > 1000 ? APP_COLORS.hex_f04438 : trace.duration_ms > 500 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_73c991;

        return (
          <div className="traces-duration-cell">
            <span className="traces-duration-value" style={{ color }}>
              {formatDuration(trace.duration_ms)}
            </span>
            <div className="traces-duration-bar-wrapper">
              <div
                className="traces-duration-bar"
                style={{ width: `${percentage}%`, background: color }}
              />
            </div>
          </div>
        );
      }
      case 'http_status_code': {
        if (!trace.http_status_code) {
          return <span style={{ color: 'var(--text-muted)' }}>—</span>;
        }

        const color =
          trace.http_status_code >= 500
            ? APP_COLORS.hex_f04438
            : trace.http_status_code >= 400
              ? APP_COLORS.hex_f79009
              : APP_COLORS.hex_73c991;

        return (
          <span className="font-mono" style={{ fontWeight: 600, color }}>
            {trace.http_status_code}
          </span>
        );
      }
      case 'start_time':
        return <span className="traces-timestamp">{formatTimestamp(trace.start_time)}</span>;
      case 'operation_name':
        return (
          <div className="traces-operation-cell">
            <span className="traces-operation-name" title={trace.operation_name}>
              {trace.operation_name || '—'}
            </span>
            {(trace.http_method || (trace.http_status_code && trace.http_status_code > 0)) && (
              <div className="traces-http-meta">
                <TraceMethodBadge method={trace.http_method as any} />
                {trace.http_status_code && trace.http_status_code > 0 && (
                  <span className="traces-http-code">HTTP {trace.http_status_code}</span>
                )}
              </div>
            )}
            <span className="trace-row-duration">
              {formatDuration(trace.duration_ms)}
            </span>
          </div>
        );
      default:
        return <span>{String(trace[columnKey] ?? '—')}</span>;
    }
  };

  return (
    <>
      {fixedColumns.map((column) => (
        <div
          key={column.key}
          className="inline-flex items-center whitespace-nowrap overflow-hidden text-ellipsis shrink-0 border-r border-[color:var(--glass-border)] px-[10px] py-[6px] box-border min-h-[34px]"
          style={{ width: colWidths[column.key] }}
          onClick={() => onOpenDetail(trace)}
        >
          {renderCell(column.key)}
        </div>
      ))}
      {flexColumn && (
        <div className="inline-flex items-center whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0 border-r-0 border-[color:var(--glass-border)] px-[10px] py-[6px] box-border min-h-[34px]" onClick={() => onOpenDetail(trace)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
            {onSelect && (
              <input 
                type="checkbox" 
                checked={isSelected}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => onSelect(trace.trace_id, e.target.checked)}
                className="trace-select-checkbox"
              />
            )}
            {renderCell(flexColumn.key)}
          </div>
        </div>
      )}
    </>
  );
});

export default TracesTableRow;
