import { Button } from '@shared/design-system';
import { Sparkles, X } from 'lucide-react';
import './AiNarrationCard.css';

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

  const severityClass = `ai-narration--${anomaly.severity}`;

  return (
    <div className={`ai-narration ${severityClass}`}>
      <div className="ai-narration__icon">
        <Sparkles size={14} />
      </div>
      <div className="ai-narration__body">
        <p className="ai-narration__summary">{anomaly.summary}</p>
        {anomaly.correlatedEvent && (
          <p className="ai-narration__correlated">
            Correlated: {anomaly.correlatedEvent}
          </p>
        )}
        <div className="ai-narration__actions">
          <Button
            size="sm"
            variant="secondary"
            className="ai-narration__btn-investigate"
            onClick={onInvestigate}
          >
            Investigate
          </Button>
        </div>
      </div>
      <button className="ai-narration__dismiss" onClick={onDismiss} title="Dismiss">
        <X size={13} />
      </button>
    </div>
  );
}
