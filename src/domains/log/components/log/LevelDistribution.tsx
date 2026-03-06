import { formatNumber } from '@utils/formatters';

import type { LogFacet } from '../../types';

import { LevelBadge } from './LogRow';

const LEVEL_COLORS: Record<string, string> = {
  errors: '#F04438',
  warnings: '#F79009',
  infos: '#06AED5',
  debugs: '#5E60CE',
  fatals: '#D92D20',
  traces: '#98A2B3',
};

interface LevelDistributionProps {
  facets: LogFacet[];
}

/**
 *
 * @param root0
 * @param root0.facets
 */
export default function LevelDistribution({ facets }: LevelDistributionProps) {
  if (!facets.length) return <div className="logs-chart-empty">No data</div>;

  const total = facets.reduce((sum: number, facet: LogFacet) => sum + (facet.count || 0), 0) || 1;

  return (
    <div className="logs-level-dist">
      {facets.map((facet: LogFacet) => {
        const level = (facet.value || 'INFO').toUpperCase();
        const color = LEVEL_COLORS[`${level.toLowerCase()}s`] || '#98A2B3';
        const pct = ((facet.count / total) * 100).toFixed(1);

        return (
          <div key={facet.value} className="logs-level-dist-row">
            <LevelBadge level={level} />
            <div className="logs-level-dist-bar-bg">
              <div className="logs-level-dist-bar-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="logs-level-dist-count">{formatNumber(facet.count)}</span>
          </div>
        );
      })}
    </div>
  );
}
