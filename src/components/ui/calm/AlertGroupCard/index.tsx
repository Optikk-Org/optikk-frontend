import './AlertGroupCard.css';

/**
 *
 */
export interface Alert {
  id: string;
  name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  firedAt: string;
  summary: string;
}

interface AlertGroupCardProps {
  service: string;
  alerts: Alert[];
  onAlertClick?: (id: string) => void;
}

const SEVERITY_COLOR: Record<Alert['severity'], string> = {
  critical: 'var(--color-critical, #DC2626)',
  high: 'var(--severity-high, #EA580C)',
  medium: 'var(--color-degraded, #D97706)',
  low: 'var(--color-unknown, #6B7280)',
};

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AlertGroupCard({ service, alerts, onAlertClick }: AlertGroupCardProps) {
  if (alerts.length === 0) return null;

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;

  return (
    <div className={`alert-group ${criticalCount > 0 ? 'alert-group--has-critical' : ''}`}>
      <div className="alert-group__header">
        <span className="alert-group__service">{service}</span>
        <span className="alert-group__count">{alerts.length} alert{alerts.length !== 1 ? 's' : ''}</span>
      </div>
      <ul className="alert-group__list">
        {alerts.map((alert) => (
          <li
            key={alert.id}
            className="alert-group__item"
            onClick={() => onAlertClick?.(alert.id)}
            role={onAlertClick ? 'button' : undefined}
            tabIndex={onAlertClick ? 0 : undefined}
          >
            <span
              className="alert-group__dot"
              style={{ background: SEVERITY_COLOR[alert.severity] }}
            />
            <span className="alert-group__name">{alert.name}</span>
            <span className="alert-group__time">{formatRelative(alert.firedAt)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
