import { Check, Settings2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface BoardColumnSettingsPopoverProps {
  columns: Array<{ key: string; label: string }>;
  visibleCols: Record<string, boolean>;
  onToggle: (columnKey: string) => void;
}

/**
 *
 * @param root0
 * @param root0.columns
 * @param root0.visibleCols
 * @param root0.onToggle
 */
export default function BoardColumnSettingsPopover({
  columns,
  visibleCols,
  onToggle,
}: BoardColumnSettingsPopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button className="oboard__btn" onClick={() => setOpen((o) => !o)}>
        <Settings2 size={13} /> Columns
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 0', minWidth: 180, boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ padding: '4px 12px 8px', fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)' }}>Columns</div>
          <div className="oboard__col-settings">
            {columns.map((column) => {
              const checked = Boolean(visibleCols[column.key]);
              return (
                <div
                  key={column.key}
                  className={`oboard__col-setting-item ${checked ? 'checked' : ''}`}
                  onClick={() => onToggle(column.key)}
                >
                  <span className="oboard__col-cb">{checked ? <Check size={9} /> : null}</span>
                  {column.label}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
