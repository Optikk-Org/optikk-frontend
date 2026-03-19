import { ReactNode } from 'react';
import './DetailDrawer.css';

interface DetailDrawerField {
  label: string;
  key: string;
  render?: (value: unknown, data: Record<string, unknown>) => ReactNode;
}

interface DetailDrawerSection {
  title?: string;
  fields: DetailDrawerField[];
}

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: number;
  sections?: DetailDrawerSection[];
  data: Record<string, unknown>;
  extra?: ReactNode;
}

/**
 * Generic slide-out drawer for viewing details of any record.
 * @param root0
 * @param root0.open
 * @param root0.onClose
 * @param root0.title
 * @param root0.width
 * @param root0.sections
 * @param root0.data
 * @param root0.extra
 */
export default function DetailDrawer({
  open,
  onClose,
  title = 'Details',
  width = 640,
  sections = [],
  data,
  extra,
}: DetailDrawerProps) {
  if (!data || !open) return null;

  return (
    <div
      className="detail-drawer"
      style={{ position: 'fixed', top: 0, right: 0, width, height: '100%', zIndex: 1100, background: 'var(--bg-card, #fff)', boxShadow: '-2px 0 8px rgba(0,0,0,0.12)', overflow: 'auto' }}
    >
      <div className="detail-drawer-header" style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color, #e8e8e8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>&times;</button>
      </div>
      <div style={{ padding: '16px 24px' }}>
        {sections.map((section, idx) => (
          <div key={idx} className="detail-drawer-section">
            {section.title && (
              <h4 className="detail-drawer-section-title">{section.title}</h4>
            )}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 16 }}>
              <tbody>
                {section.fields.map((field) => (
                  <tr key={field.key} style={{ borderBottom: '1px solid var(--border-color, #e8e8e8)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 500, width: '30%', verticalAlign: 'top' }}>{field.label}</td>
                    <td style={{ padding: '8px 12px' }}>
                      {field.render
                        ? field.render(data[field.key], data)
                        : renderValue(data[field.key])}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {extra}
      </div>
    </div>
  );
}

function renderValue(value: unknown) {
  if (value == null) return <span style={{ color: 'var(--text-secondary, #999)' }}>-</span>;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(value, null, 2)}</pre>;
  return String(value);
}
