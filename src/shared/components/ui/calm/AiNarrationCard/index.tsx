import { Button } from '@/components/ui';
import { Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 *
 */
export interface AnomalyEvent {
  summary: string;
  service: string;
  timestamp: string;
  correlatedEvent?: string;
  severity: 'info' | 'warning' | 'critical';
}

interface AiNarrationCardProps {
  anomaly: AnomalyEvent | null;
  onDismiss: () => void;
  onInvestigate: () => void;
}

export default function AiNarrationCard({ anomaly, onDismiss, onInvestigate }: AiNarrationCardProps) {
  if (!anomaly) return null;

  const isWarning = anomaly.severity === 'warning';
  const isCritical = anomaly.severity === 'critical';

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3.5 rounded-[var(--card-radius,12px)] border-l-[3px] mb-[var(--space-section-gap,20px)] relative',
        !isWarning && !isCritical && 'bg-[var(--color-ai-subtle)] border-l-[var(--color-ai-accent)]',
        isWarning && 'bg-[var(--severity-medium-subtle)] border-l-[var(--color-degraded)]',
        isCritical && 'bg-[var(--severity-critical-subtle)] border-l-[var(--color-critical)]',
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 mt-px',
          !isWarning && !isCritical && 'bg-[var(--color-ai-subtle)] text-[color:var(--color-ai-accent)]',
          isWarning && 'bg-[var(--severity-medium-subtle)] text-[color:var(--color-degraded)]',
          isCritical && 'bg-[var(--severity-critical-subtle)] text-[color:var(--color-critical)]',
        )}
      >
        <Sparkles size={14} />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <p className="text-[var(--text-sm,13px)] text-[color:var(--text-primary)] leading-[1.5] m-0">
          {anomaly.summary}
        </p>
        {anomaly.correlatedEvent && (
          <p className="text-[var(--text-xs,11px)] text-[color:var(--text-secondary)] m-0">
            Correlated: {anomaly.correlatedEvent}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={onInvestigate}
            className="text-[var(--text-xs,11px)] h-[26px] px-2.5 border-[var(--color-ai-accent)] text-[color:var(--color-ai-accent)]"
          >
            Investigate
          </Button>
        </div>
      </div>

      {/* Dismiss */}
      <button
        className="flex items-center justify-center w-6 h-6 bg-transparent border-0 cursor-pointer rounded text-[color:var(--text-muted)] flex-shrink-0 transition-[color,background] duration-150 hover:text-[color:var(--text-primary)] hover:bg-[var(--bg-hover)]"
        onClick={onDismiss}
        title="Dismiss"
      >
        <X size={13} />
      </button>
    </div>
  );
}
