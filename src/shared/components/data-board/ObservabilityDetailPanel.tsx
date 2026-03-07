import { Clock, Copy, Check, Filter, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';

const EMPTY_VALUE_PLACEHOLDER = '—';
const COPY_CONFIRMATION_DURATION_MS = 1500;

type BoardFilterValue = string | number | boolean;

interface BoardFilter {
  field: string;
  value: BoardFilterValue;
  operator: 'equals';
}

function isFilterValue(value: unknown): value is BoardFilterValue {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

interface CopyableValueProps {
  value: unknown;
}

function CopyableValue({ value }: CopyableValueProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  if (value === null || value === undefined || value === '') {
    return <span style={{ color: 'var(--text-muted)' }}>{EMPTY_VALUE_PLACEHOLDER}</span>;
  }

  const handleCopy = (): void => {
    if (!navigator.clipboard) return;

    void navigator.clipboard
      .writeText(String(value))
      .then(() => {
        setCopied(true);
        window.setTimeout(() => {
          setCopied(false);
        }, COPY_CONFIRMATION_DURATION_MS);
      })
      .catch(() => undefined);
  };

  return (
    <div className="oboard__detail-field-value" onClick={handleCopy} title="Click to copy">
      <span>{String(value)}</span>
      {copied ? (
        <Check size={10} style={{ marginLeft: 6, color: 'var(--color-success)' }} />
      ) : (
        <Copy size={10} style={{ marginLeft: 6, opacity: 0.35 }} />
      )}
    </div>
  );
}

export interface DetailPanelField {
  key: string;
  label: string;
  value: unknown;
  filterable?: boolean;
}

export interface ObservabilityDetailPanelProps {
  title?: string;
  titleBadge?: ReactNode;
  metaLine?: string;
  metaRight?: string;
  summary?: string;
  summaryNode?: ReactNode;
  fields?: DetailPanelField[];
  actions?: ReactNode;
  rawData?: unknown;
  onClose: () => void;
  onAddFilter?: (filter: BoardFilter) => void;
}

/**
 * Side detail panel for an observability row.
 * @param props Detail panel props.
 * @returns Detail panel UI.
 */
export function ObservabilityDetailPanel({
  title = 'Detail',
  titleBadge,
  metaLine,
  metaRight,
  summary,
  summaryNode,
  fields = [],
  actions,
  rawData,
  onClose,
  onAddFilter,
}: ObservabilityDetailPanelProps): JSX.Element {
  const [tab, setTab] = useState<'fields' | 'json'>('fields');

  return (
    <div className="oboard__detail-overlay" onClick={(event) => event.stopPropagation()}>
      <div className="oboard__detail-header">
        <div className="oboard__detail-title">
          {title}
          {titleBadge}
        </div>
        <button className="oboard__detail-close" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {metaLine && (
        <div className="oboard__detail-meta">
          <Clock size={12} />
          <span>{metaLine}</span>
          {metaRight && <span className="oboard__detail-meta-right">{metaRight}</span>}
        </div>
      )}

      {(summary || summaryNode) && <div className="oboard__detail-summary">{summaryNode || summary}</div>}

      {actions && <div className="oboard__detail-actions">{actions}</div>}

      <div className="oboard__detail-tabs">
        {(['fields', 'json'] as const).map((tabKey) => (
          <button
            key={tabKey}
            className={`oboard__detail-tab ${tab === tabKey ? 'oboard__detail-tab--active' : ''}`}
            onClick={() => setTab(tabKey)}
          >
            {tabKey === 'fields' ? 'Fields' : 'JSON'}
          </button>
        ))}
      </div>

      <div className="oboard__detail-body">
        {tab === 'fields' && (
          <div className="oboard__detail-fields">
            {fields.map(({ key, label, value, filterable }) => {
              const canFilter = Boolean(filterable && onAddFilter && isFilterValue(value));

              return (
                <div key={key} className="oboard__detail-field">
                  <div className="oboard__detail-field-label">
                    {label}
                    {canFilter && (
                      <button
                        className="oboard__detail-filter-btn"
                        onClick={() => {
                          if (onAddFilter && isFilterValue(value)) {
                            onAddFilter({ field: key, value, operator: 'equals' });
                          }
                        }}
                        title={`Filter by ${label} = "${String(value)}"`}
                      >
                        <Filter size={10} />
                      </button>
                    )}
                  </div>
                  <CopyableValue value={value} />
                </div>
              );
            })}
          </div>
        )}

        {tab === 'json' && <pre className="oboard__detail-json">{JSON.stringify(rawData, null, 2)}</pre>}
      </div>
    </div>
  );
}
