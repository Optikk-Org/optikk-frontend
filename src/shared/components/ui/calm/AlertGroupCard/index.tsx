import { cn } from '@/lib/utils';

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
    <div
      className={cn(
        'bg-[var(--bg-card)] rounded-[var(--card-radius,12px)] border-[var(--card-border)] border shadow-[var(--card-shadow)] overflow-hidden',
        criticalCount > 0 && 'border-l-[3px] border-l-[var(--color-critical)]',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-light)]">
        <span className="text-[var(--text-sm,13px)] font-semibold text-[color:var(--text-primary)]">
          {service}
        </span>
        <span className="text-[var(--text-xs,11px)] text-[color:var(--text-secondary)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full">
          {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Alert list */}
      <ul className="list-none m-0 py-1">
        {alerts.map((alert) => (
          <li
            key={alert.id}
            className="flex items-center gap-2.5 px-4 py-2 cursor-default transition-[background] duration-[0.12s] hover:bg-[var(--bg-hover)]"
            onClick={() => onAlertClick?.(alert.id)}
            role={onAlertClick ? 'button' : undefined}
            tabIndex={onAlertClick ? 0 : undefined}
            style={{ cursor: onAlertClick ? 'pointer' : 'default' }}
          >
            <span
              className="w-[7px] h-[7px] rounded-full flex-shrink-0"
              style={{ background: SEVERITY_COLOR[alert.severity] }}
            />
            <span className="flex-1 text-[var(--text-sm,13px)] text-[color:var(--text-primary)] whitespace-nowrap overflow-hidden text-ellipsis">
              {alert.name}
            </span>
            <span className="text-[var(--text-xs,11px)] text-[color:var(--text-muted)] flex-shrink-0">
              {formatRelative(alert.firedAt)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
