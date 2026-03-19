import { Bug } from 'lucide-react';

import LevelDistribution from '../log/LevelDistribution';

import type { LogFacet } from '../../types';

interface LogsLevelDistributionCardProps {
  isLoading: boolean;
  levelFacets: LogFacet[];
}

/**
 *
 * @param root0
 * @param root0.isLoading
 * @param root0.levelFacets
 */
export default function LogsLevelDistributionCard({
  isLoading,
  levelFacets,
}: LogsLevelDistributionCardProps) {
  return (
    <div className="logs-chart-card">
      <div className="logs-chart-card-header">
        <span className="logs-chart-card-title"><Bug size={15} />By Level</span>
      </div>
      <div className="logs-chart-card-body">
        {isLoading
          ? <div className="logs-chart-empty"><div className="ok-spinner" /></div>
          : <LevelDistribution facets={levelFacets} />
        }
      </div>
    </div>
  );
}
