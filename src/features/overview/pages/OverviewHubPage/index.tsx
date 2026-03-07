import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AiNarrationCard, HealthSnapshotStrip, ServiceFlyInPanel, UnifiedSignalPanel } from '@shared/components/ui/calm';

import DashboardPage from '@shared/components/ui/dashboard/DashboardPage';

import { useAnomalyNarration } from '../../hooks/useAnomalyNarration';
import { useServiceHealthSummary } from '../../hooks/useServiceHealthSummary';
import './OverviewHubPage.css';

/**
 * Overview hub — tabs (Summary / Errors / SLO) fully driven by backend YAML config.
 * Calm-tech enhancements layered above: AI narration, health ring strip, unified signal panel.
 */
export default function OverviewHubPage() {
  const navigate = useNavigate();
  const { data: services = [], isLoading: servicesLoading } = useServiceHealthSummary();
  const { data: anomaly = null } = useAnomalyNarration();
  const [dismissedAnomaly, setDismissedAnomaly] = useState(false);
  const [flyInService, setFlyInService] = useState<string | null>(null);

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

      <DashboardPage pageId="overview" />

      <ServiceFlyInPanel
        serviceName={flyInService}
        open={flyInService !== null}
        onClose={() => setFlyInService(null)}
      />
    </div>
  );
}
