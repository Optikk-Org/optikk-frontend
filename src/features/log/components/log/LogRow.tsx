import { getLogValue } from '@shared/utils/logUtils';
import { tsLabel } from '@shared/utils/time';

import type { LogColumn, LogRecord } from '../../types';
import type { ReactNode } from 'react';

import './LogRow.css';

/* ─── Level badge ─────────────────────────────────────────────────────────── */

const LEVEL_CLASS: Record<string, string> = {
  FATAL: 'log-level--fatal',
  ERROR: 'log-level--error',
  WARN: 'log-level--warn',
  WARNING: 'log-level--warn',
  INFO: 'log-level--info',
  DEBUG: 'log-level--debug',
  TRACE: 'log-level--trace',
};

function toDisplayText(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch (_error: unknown) {
    return String(value);
  }
}

interface LevelBadgeProps {
  level?: unknown;
}

export function LevelBadge({ level }: LevelBadgeProps) {
  const levelLabel = typeof level === 'string' ? level : String(level ?? 'INFO');
  const l = levelLabel.toUpperCase();
  const cls = LEVEL_CLASS[l] || LEVEL_CLASS.INFO;
  return <span className={`log-level ${cls}`}>{l}</span>;
}

/* ─── Log row for the ObservabilityDataBoard ──────────────────────────────── */

interface LogRowProps {
  log: LogRecord;
  colWidths: Record<string, number>;
  visibleCols: Record<string, boolean>;
  columns: LogColumn[];
  onOpenDetail: (log: LogRecord) => void;
}

export default function LogRow({
  log,
  colWidths,
  visibleCols,
  columns,
  onOpenDetail,
}: LogRowProps) {
  const fixedCols = columns.filter((c) => !c.flex && visibleCols[c.key]);
  const flexCol = columns.find((c) => c.flex && visibleCols[c.key]);

  const renderCell = (colKey: string): ReactNode => {
    const messageValue = toDisplayText(log.message);

    switch (colKey) {
      case 'timestamp':
        return (
          <span className="log-cell log-cell--mono log-cell--secondary">
            {tsLabel(log.timestamp)}
          </span>
        );
      case 'level':
        return <LevelBadge level={getLogValue(log, 'level')} />;
      case 'service_name':
        return (
          <span className="log-cell log-cell--service">
            <span className="log-cell__service-dot" />
            {toDisplayText(getLogValue(log, 'service_name'))}
          </span>
        );
      case 'host':
        return (
          <span className="log-cell log-cell--mono log-cell--secondary">
            {toDisplayText(log.host || log.pod)}
          </span>
        );
      case 'logger':
        return (
          <span className="log-cell log-cell--mono log-cell--muted truncate">
            {toDisplayText(log.logger)}
          </span>
        );
      case 'trace_id':
        return (
          <span className="log-cell log-cell--mono log-cell--muted truncate">
            {toDisplayText(log.traceId || log.trace_id)}
          </span>
        );
      case 'thread':
        return (
          <span className="log-cell log-cell--mono log-cell--muted">
            {toDisplayText(log.thread)}
          </span>
        );
      case 'container':
        return <span className="log-cell log-cell--muted">{toDisplayText(log.container)}</span>;
      case 'message':
        return (
          <span className="log-cell log-cell--message" title={messageValue}>
            {messageValue}
          </span>
        );
      default:
        return <span className="log-cell">{toDisplayText(log[colKey])}</span>;
    }
  };

  return (
    <div className="log-row" onClick={() => onOpenDetail(log)}>
      {fixedCols.map((col) => (
        <div
          key={col.key}
          className="inline-flex items-center whitespace-nowrap overflow-hidden text-ellipsis shrink-0 border-r border-[color:var(--glass-border)] px-[10px] py-[6px] box-border min-h-[34px]"
          style={{ width: colWidths[col.key], borderBottom: 'none' }}
        >
          {renderCell(col.key)}
        </div>
      ))}
      {flexCol && (
        <div
          className={`inline-flex items-center whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0 border-r-0 border-[color:var(--glass-border)] px-[10px] py-[6px] box-border min-h-[34px] ${flexCol.key === 'message' ? 'log-row__message-col' : ''}`}
          style={{
            ...(flexCol.key === 'message'
              ? {
                  flex: `1 0 ${colWidths[flexCol.key] ?? 720}px`,
                  minWidth: colWidths[flexCol.key] ?? 720,
                }
              : {}),
            borderBottom: 'none',
          }}
        >
          {renderCell(flexCol.key)}
        </div>
      )}
    </div>
  );
}
