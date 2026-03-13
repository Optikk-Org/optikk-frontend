import { useState } from 'react';
import { ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';
import type { LogEntry } from '@entities/log/model';

interface LogAttributesTreeProps {
  log: LogEntry;
}

function CopyableValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <span
      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3 }}
      onClick={() => {
        void navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
      title="Click to copy"
    >
      {value}
      {copied ? (
        <Check size={9} style={{ color: 'var(--color-success, #73c991)' }} />
      ) : (
        <Copy size={9} style={{ opacity: 0.3 }} />
      )}
    </span>
  );
}

function AttrRow({
  attrKey,
  value,
  depth,
}: {
  attrKey: string;
  value: unknown;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const paddingLeft = 8 + depth * 16;
  const isObject = typeof value === 'object' && value !== null;

  const valueColor =
    typeof value === 'string'
      ? 'var(--literal-hex-73c991, #73c991)'
      : typeof value === 'number'
        ? '#06aed5'
        : typeof value === 'boolean'
          ? '#f59e0b'
          : 'var(--text-secondary)';

  if (isObject) {
    const entries = Object.entries(value as Record<string, unknown>);
    return (
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            paddingLeft,
            paddingTop: 3,
            paddingBottom: 3,
            cursor: 'pointer',
            borderRadius: 4,
            userSelect: 'none',
          }}
          onClick={() => setExpanded((e) => !e)}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              'var(--literal-rgba-255-255-255-0p04, rgba(255,255,255,0.04))';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          {expanded ? (
            <ChevronDown size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          ) : (
            <ChevronRight size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          )}
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{attrKey}</span>
          <span style={{ color: 'var(--text-muted)', marginLeft: 4, fontSize: 10 }}>
            {`{${entries.length}}`}
          </span>
        </div>
        {expanded &&
          entries.map(([k, v]) => <AttrRow key={k} attrKey={k} value={v} depth={depth + 1} />)}
      </div>
    );
  }

  const displayValue =
    typeof value === 'string' ? `"${value}"` : String(value ?? '—');
  const copyValue = String(value ?? '');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 6,
        paddingLeft: paddingLeft + 16,
        paddingTop: 2,
        paddingBottom: 2,
        paddingRight: 8,
        borderRadius: 4,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background =
          'var(--literal-rgba-255-255-255-0p04, rgba(255,255,255,0.04))';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      <span
        style={{
          color: 'var(--text-secondary)',
          fontWeight: 600,
          flexShrink: 0,
          fontSize: 12,
        }}
      >
        {attrKey}
      </span>
      <span style={{ color: 'var(--text-muted)', flexShrink: 0, fontSize: 12 }}>:</span>
      <span style={{ color: valueColor, wordBreak: 'break-all', fontSize: 12 }}>
        <CopyableValue value={displayValue} />
        {copyValue && copyValue !== displayValue && (
          <span style={{ display: 'none' }}>{copyValue}</span>
        )}
      </span>
    </div>
  );
}

export default function LogAttributesTree({ log }: LogAttributesTreeProps) {
  const attrString = (log as Record<string, unknown>).attributes_string as
    | Record<string, unknown>
    | undefined;
  const attrNumber = (log as Record<string, unknown>).attributes_number as
    | Record<string, unknown>
    | undefined;
  const attrBool = (log as Record<string, unknown>).attributes_bool as
    | Record<string, unknown>
    | undefined;

  const sections: Array<{ label: string; data: Record<string, unknown>; color: string }> = [
    {
      label: 'String',
      data: (attrString ?? {}) as Record<string, unknown>,
      color: 'var(--literal-hex-73c991, #73c991)',
    },
    {
      label: 'Number',
      data: (attrNumber ?? {}) as Record<string, unknown>,
      color: '#06aed5',
    },
    {
      label: 'Boolean',
      data: (attrBool ?? {}) as Record<string, unknown>,
      color: '#f59e0b',
    },
  ].filter((s) => Object.keys(s.data).length > 0);

  if (sections.length === 0) {
    return (
      <div
        style={{
          padding: '24px 0',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: 12,
        }}
      >
        No attributes recorded for this log entry
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'monospace' }}>
      {sections.map((section) => (
        <div key={section.label} style={{ marginBottom: 8 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: section.color,
              padding: '4px 8px',
              marginBottom: 2,
            }}
          >
            {section.label} Attributes
          </div>
          {Object.entries(section.data).map(([k, v]) => (
            <AttrRow key={k} attrKey={k} value={v} depth={0} />
          ))}
        </div>
      ))}
    </div>
  );
}
