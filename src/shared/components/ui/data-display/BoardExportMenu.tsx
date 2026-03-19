import { Download } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface BoardExportMenuProps {
  entityName: string;
  rowsLength: number;
  onExportCSV: () => void;
  onExportJSON: () => void;
}

/**
 *
 * @param root0
 * @param root0.entityName
 * @param root0.rowsLength
 * @param root0.onExportCSV
 * @param root0.onExportJSON
 */
export default function BoardExportMenu({
  entityName,
  rowsLength,
  onExportCSV,
  onExportJSON,
}: BoardExportMenuProps) {
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
      <button className="oboard__btn" disabled={rowsLength === 0} onClick={() => setOpen((o) => !o)}>
        <Download size={13} /> Export
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8, padding: 8, minWidth: 160, boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ padding: '4px 8px 8px', fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)' }}>Export {entityName}s</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 0' }}>
            <button
              className="oboard__btn"
              onClick={() => { onExportCSV(); setOpen(false); }}
              disabled={rowsLength === 0}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              Export as CSV
            </button>
            <button
              className="oboard__btn"
              onClick={() => { onExportJSON(); setOpen(false); }}
              disabled={rowsLength === 0}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              Export as JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
