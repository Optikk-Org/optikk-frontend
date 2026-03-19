import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { AiNarrationCard, HealthSnapshotStrip, ServiceFlyInPanel, UnifiedSignalPanel } from '@shared/components/ui/calm';
import DashboardPage from '@shared/components/ui/dashboard/DashboardPage';
import { useDensity } from '@shared/design-system/providers/DensityProvider';
import { useAppStore } from '@store/appStore';

import { useAnomalyNarration } from '../../hooks/useAnomalyNarration';
import { useServiceHealthSummary } from '../../hooks/useServiceHealthSummary';
import './OverviewHubPage.css';

/**
 * Overview hub — tabs (Summary / Errors / SLO) fully driven by backend YAML config.
 * Calm-tech enhancements layered above: AI narration, health ring strip, unified signal panel.
 * Calm-tech sections are collapsible and default to collapsed in compact density mode.
 */
export default function OverviewHubPage() {
  const navigate = useNavigate();
  const density = useDensity();
  const { viewPreferences, setViewPreference } = useAppStore();
  const { data: services = [], isLoading: servicesLoading } = useServiceHealthSummary();
  const { data: anomaly = null } = useAnomalyNarration();
  const [dismissedAnomaly, setDismissedAnomaly] = useState(false);
  const [flyInService, setFlyInService] = useState<string | null>(null);

  const calmCollapsed = (viewPreferences?.overviewCalmCollapsed as boolean) ?? density === 'compact';

  const toggleCalm = () => {
    setViewPreference('overviewCalmCollapsed', !calmCollapsed);
  };

  const handleServiceClick = (name: string) => {
    setFlyInService(name);
  };

  const handleInvestigate = () => {
    if (anomaly?.service) {
      navigate(`/services/${encodeURIComponent(anomaly.service)}`);
    }
  };

  return (
    <div className="overview-hub">
      {/* Calm-tech section — collapsible */}
      <div className="overview-hub__calm-header">
        <button className="overview-hub__calm-toggle" onClick={toggleCalm}>
          {calmCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          {calmCollapsed ? 'Show health overview' : 'Hide health overview'}
        </button>
      </div>

      {!calmCollapsed && (
        <div className="overview-hub__calm-section">
          {!dismissedAnomaly && (
            <AiNarrationCard
              anomaly={anomaly}
              onDismiss={() => setDismissedAnomaly(true)}
              onInvestigate={handleInvestigate}
            />
          )}

          <HealthSnapshotStrip
            services={services}
            onServiceClick={handleServiceClick}
            loading={servicesLoading}
          />

          <UnifiedSignalPanel />
        </div>
      )}

      <DashboardPage pageId="overview" />

      <ServiceFlyInPanel
        serviceName={flyInService}
        open={flyInService !== null}
        onClose={() => setFlyInService(null)}
      />
    </div>
  );
}
