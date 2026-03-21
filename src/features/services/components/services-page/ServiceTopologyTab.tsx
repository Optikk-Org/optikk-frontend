import { Badge, Skeleton, Surface } from '@/components/ui';
import { ArrowRight, GitBranch, Network, ShieldAlert } from 'lucide-react';

import ServiceGraph from '@shared/components/ui/charts/specialized/ServiceGraph';
import { FilterBar, HealthIndicator, StatCardsGrid } from '@shared/components/ui';
import ObservabilityDataBoard, { boardHeight } from '@shared/components/ui/data-display/ObservabilityDataBoard';

import { formatNumber, formatDuration } from '@shared/utils/formatters';

import { APP_COLORS } from '@config/colorLiterals';

import type {
  ServiceDependencyRow,
  ServiceHealthOption,
  ServiceTopologyEdge,
  ServiceTopologyNode,
  ServiceTopologyStats,
} from '../../types';

const DEP_COLUMNS = [
  { key: 'source', label: 'Source', defaultWidth: 180 },
  { key: 'target', label: 'Target', defaultWidth: 180 },
  { key: 'callCount', label: 'Calls', defaultWidth: 120 },
  { key: 'avgLatency', label: 'Avg Latency', defaultWidth: 120 },
  { key: 'errorRate', label: 'Error Rate', defaultWidth: 120 },
  { key: 'risk', label: 'Risk Score', defaultWidth: 120, flex: true },
];

interface ServiceTopologyTabProps {
  topologyStats: ServiceTopologyStats;
  topologyLoading: boolean;
  topologyError: Error | null;
  topologyNodes: ServiceTopologyNode[];
  topologyEdges: ServiceTopologyEdge[];
  criticalServices: ServiceTopologyNode[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  healthFilter: string;
  setHealthFilter: (value: string) => void;
  healthOptions: ServiceHealthOption[];
  dependencyRows: ServiceDependencyRow[];
  onNodeClick: (name: string) => void;
}

/**
 *
 * @param root0
 * @param root0.topologyStats
 * @param root0.topologyLoading
 * @param root0.topologyError
 * @param root0.topologyNodes
 * @param root0.topologyEdges
 * @param root0.criticalServices
 * @param root0.searchQuery
 * @param root0.setSearchQuery
 * @param root0.healthFilter
 * @param root0.setHealthFilter
 * @param root0.healthOptions
 * @param root0.dependencyRows
 * @param root0.onNodeClick
 */
export function ServiceTopologyTab({
  topologyStats,
  topologyLoading,
  topologyError,
  topologyNodes,
  topologyEdges,
  criticalServices,
  searchQuery,
  setSearchQuery,
  healthFilter,
  setHealthFilter,
  healthOptions,
  dependencyRows,
  onNodeClick,
}: ServiceTopologyTabProps) {
  return (
    <>
      <StatCardsGrid
        style={{ marginBottom: 16 }}
        stats={[
          {
            metric: { title: 'Services in Graph', value: formatNumber(topologyStats.graphServices) },
            visuals: { icon: <Network size={20} />, iconColor: APP_COLORS.hex_5e60ce, loading: topologyLoading },
          },
          {
            metric: { title: 'Dependencies', value: formatNumber(topologyStats.dependencies) },
            visuals: { icon: <GitBranch size={20} />, iconColor: APP_COLORS.hex_06aed5, loading: topologyLoading },
          },
          {
            metric: { title: 'Critical Services', value: formatNumber(topologyStats.criticalServices) },
            visuals: { icon: <ShieldAlert size={20} />, iconColor: APP_COLORS.hex_f79009, loading: topologyLoading },
          },
          {
            metric: { title: 'High-Risk Edges', value: formatNumber(topologyStats.highRiskEdges) },
            visuals: { icon: <ArrowRight size={20} />, iconColor: APP_COLORS.hex_f04438, loading: topologyLoading },
          },
        ]}
      />

      <FilterBar
        filters={[
          {
            type: 'search',
            key: 'searchGraph',
            placeholder: 'Filter graph by service name...',
            value: searchQuery,
            onChange: (event) => setSearchQuery(event.target.value),
            width: 460,
          },
        ]}
        actions={
          <div className="services-health-tags">
            {healthOptions.map((option: ServiceHealthOption) => (
              <Badge
                key={option.key}
                style={{ cursor: 'pointer', borderColor: option.color, background: healthFilter === option.key ? (option.color || 'blue') : 'transparent', color: healthFilter === option.key ? '#fff' : 'inherit' }}
                onClick={() => setHealthFilter(option.key)}
              >
                {option.label} ({option.count})
              </Badge>
            ))}
          </div>
        }
      />

      <div>
        <Surface elevation={1} padding="md" className="services-panel-card services-graph-card">
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Service Dependency Graph</div>
          {topologyLoading ? (
            <div className="services-loading-container">
              <Skeleton />
            </div>
          ) : topologyError ? (
            <div className="text-muted services-empty" style={{ textAlign: 'center', padding: 32 }}>Failed to load topology</div>
          ) : topologyNodes.length === 0 ? (
            <div className="text-muted services-empty" style={{ textAlign: 'center', padding: 32 }}>No services found for this filter</div>
          ) : (
            <ServiceGraph
              nodes={topologyNodes}
              edges={topologyEdges}
              onNodeClick={(node: { name?: string }) => {
                if (typeof node.name === 'string' && node.name) {
                  onNodeClick(node.name);
                }
              }}
            />
          )}
        </Surface>
      </div>

      <div style={{ marginTop: 16 }}>
        <Surface elevation={1} padding="md" className="services-panel-card services-risk-card">
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Critical Service Risks</div>
          {topologyLoading ? (
            <Skeleton />
          ) : criticalServices.length === 0 ? (
            <div className="text-muted" style={{ textAlign: 'center', padding: 32 }}>No service risks</div>
          ) : (
              <div className="services-risk-list">
                {criticalServices.map((service: ServiceTopologyNode) => (
                  <button
                    key={service.name}
                    className="services-risk-item"
                    onClick={() => onNodeClick(service.name)}
                  >
                    <div className="services-risk-item-top">
                      <div className="services-risk-service">
                        <HealthIndicator status={service.status} size={8} />
                        <span>{service.name}</span>
                      </div>
                      <ArrowRight size={15} />
                    </div>
                    <div className="services-risk-meta">
                      <span>Risk {service.riskScore ?? 0}</span>
                      <span>{service.errorRate.toFixed(2)}% errors</span>
                      <span>{formatDuration(service.avgLatency)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
        </Surface>
      </div>

      <Surface
        elevation={1}
        padding="md"
        className="services-panel-card"
        style={{ marginTop: 16 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 600 }}>Dependency Contracts</div>
          <span className="services-card-extra">Top edges ranked by risk score</span>
        </div>
        <div style={{ height: boardHeight(15) }}>
          <ObservabilityDataBoard<ServiceDependencyRow>
            data={{ rows: dependencyRows, isLoading: topologyLoading }}
            config={{
              columns: DEP_COLUMNS,
              rowKey: (row) => row.key,
              entityName: 'dependency',
              storageKey: 'services-deps-board-cols',
              renderRow: (row, { colWidths, visibleCols }) => (
                <>
                  {visibleCols.source && (
                    <div style={{ width: colWidths.source, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <HealthIndicator status={row.sourceStatus} size={7} />
                      <a onClick={() => onNodeClick(row.source)} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.source}</a>
                    </div>
                  )}
                  {visibleCols.target && (
                    <div style={{ width: colWidths.target, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <HealthIndicator status={row.targetStatus} size={7} />
                      <a onClick={() => onNodeClick(row.target)} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.target}</a>
                    </div>
                  )}
                  {visibleCols.callCount && (
                    <div style={{ width: colWidths.callCount, flexShrink: 0 }}>{formatNumber(row.callCount)}</div>
                  )}
                  {visibleCols.avgLatency && (
                    <div style={{ width: colWidths.avgLatency, flexShrink: 0 }}>{formatDuration(row.avgLatency)}</div>
                  )}
                  {visibleCols.errorRate && (
                    <div style={{ width: colWidths.errorRate, flexShrink: 0, color: row.errorRate > 5 ? APP_COLORS.hex_f04438 : row.errorRate > 1 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_73c991, fontWeight: 600 }}>
                      {row.errorRate.toFixed(2)}%
                    </div>
                  )}
                  {visibleCols.risk && (
                    <div style={{ flex: 1, color: row.risk > 70 ? APP_COLORS.hex_f04438 : row.risk > 45 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_73c991, fontWeight: 600 }}>
                      {row.risk}
                    </div>
                  )}
                </>
              ),
              emptyTips: [
                { num: 1, text: <>No service dependencies detected yet</> },
                { num: 2, text: <>Ensure services are making <strong>outbound calls</strong> to each other</> },
              ]
            }}
          />
        </div>
      </Surface>
    </>
  );
}
