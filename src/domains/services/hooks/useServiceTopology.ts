import { useMemo } from 'react';

import { servicesPageService } from '@services/servicesPageService';

import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';

import {
  asRecord,
  asArray,
  toNumber,
  normalizeTopologyNode,
  normalizeTopologyEdge,
  getServiceStatus,
  calcRiskScore,
} from '../utils/servicesUtils';

import type {
  ServiceTopologyEdge,
  ServiceTopologyNode,
  ServiceDependencyRow,
  ServiceHealthOption,
} from '../types';

/**
 *
 */
export function useServiceTopology({
  searchQuery,
  healthFilter,
}: {
  searchQuery: string;
  healthFilter: string;
}) {
  const {
    data: topologyDataRaw,
    isLoading: topologyLoading,
    error: topologyError,
  } = useTimeRangeQuery(
    'service-topology',
    (teamId, startTime, endTime) => servicesPageService.getTopology(teamId, startTime, endTime),
  );

  const topologyData = asRecord(topologyDataRaw);

  const allTopologyNodes = useMemo<ServiceTopologyNode[]>(
    () => asArray(topologyData.nodes).map(normalizeTopologyNode),
    [topologyData.nodes],
  );

  const allTopologyEdges = useMemo<ServiceTopologyEdge[]>(
    () => asArray(topologyData.edges).map(normalizeTopologyEdge),
    [topologyData.edges],
  );

  const adjacency = useMemo(() => {
    const out = new Map<string, number>();
    const inbound = new Map<string, number>();

    for (const edge of allTopologyEdges) {
      out.set(edge.source, (out.get(edge.source) || 0) + 1);
      inbound.set(edge.target, (inbound.get(edge.target) || 0) + 1);
    }

    return { out, inbound };
  }, [allTopologyEdges]);

  const normalizedTopologyNodes = useMemo<ServiceTopologyNode[]>(() => {
    return allTopologyNodes.map((node) => {
      const errorRate = toNumber(node.errorRate);
      const avgLatency = toNumber(node.avgLatency);
      const dependencyCount = (adjacency.out.get(node.name) || 0) + (adjacency.inbound.get(node.name) || 0);

      return {
        ...node,
        name: node.name,
        requestCount: toNumber(node.requestCount),
        errorRate,
        avgLatency,
        status: node.status || getServiceStatus(errorRate),
        dependencyCount,
        riskScore: calcRiskScore({ errorRate, avgLatency, dependencyCount }),
      };
    });
  }, [allTopologyNodes, adjacency]);

  const topologyNodes = useMemo<ServiceTopologyNode[]>(() => {
    let rows = normalizedTopologyNodes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      rows = rows.filter((row) => row.name.toLowerCase().includes(query));
    }

    if (healthFilter !== 'all') {
      rows = rows.filter((row) => row.status.toLowerCase() === healthFilter);
    }

    return rows;
  }, [normalizedTopologyNodes, searchQuery, healthFilter]);

  const topologyNodeNames = useMemo(
    () => new Set(topologyNodes.map((node) => node.name)),
    [topologyNodes],
  );

  const topologyEdges = useMemo<ServiceTopologyEdge[]>(
    () =>
      allTopologyEdges.filter(
        (edge) => topologyNodeNames.has(edge.source) && topologyNodeNames.has(edge.target),
      ),
    [allTopologyEdges, topologyNodeNames],
  );

  const topologyStats = useMemo(() => {
    const unhealthy = topologyNodes.filter((node) => node.status === 'unhealthy').length;
    const degraded = topologyNodes.filter((node) => node.status === 'degraded').length;
    const highRiskEdges = topologyEdges.filter((edge) => toNumber(edge.errorRate) > 5).length;

    return {
      graphServices: topologyNodes.length,
      dependencies: topologyEdges.length,
      criticalServices: unhealthy + degraded,
      highRiskEdges,
    };
  }, [topologyNodes, topologyEdges]);

  const criticalServices = useMemo<ServiceTopologyNode[]>(() => {
    return [...topologyNodes]
      .sort((left, right) => toNumber(right.riskScore) - toNumber(left.riskScore))
      .slice(0, 8);
  }, [topologyNodes]);

  const topologyNodesByName = useMemo(
    () => new Map(normalizedTopologyNodes.map((node) => [node.name, node])),
    [normalizedTopologyNodes],
  );

  const dependencyRows = useMemo<ServiceDependencyRow[]>(() => {
    return topologyEdges
      .map((edge, index) => {
        const source = topologyNodesByName.get(edge.source);
        const target = topologyNodesByName.get(edge.target);
        const errorRate = toNumber(edge.errorRate);
        const avgLatency = toNumber(edge.avgLatency);
        const callCount = toNumber(edge.callCount);

        return {
          key: `${edge.source}-${edge.target}-${index}`,
          source: edge.source,
          target: edge.target,
          sourceStatus: source?.status || 'healthy',
          targetStatus: target?.status || 'healthy',
          errorRate,
          avgLatency,
          callCount,
          risk: calcRiskScore({ errorRate, avgLatency, dependencyCount: 1 }),
        };
      })
      .sort((a, b) => b.errorRate - a.errorRate);
  }, [topologyEdges, topologyNodesByName]);

  const healthOptions = useMemo<ServiceHealthOption[]>(() => {
    const counts = { healthy: 0, degraded: 0, unhealthy: 0 };
    for (const node of normalizedTopologyNodes) {
      if (node.status === 'healthy') counts.healthy++;
      if (node.status === 'degraded') counts.degraded++;
      if (node.status === 'unhealthy') counts.unhealthy++;
    }

    return [
      { label: `All (${normalizedTopologyNodes.length})`, value: 'all', key: 'all', count: normalizedTopologyNodes.length },
      { label: `Healthy (${counts.healthy})`, value: 'healthy', key: 'healthy', count: counts.healthy },
      { label: `Degraded (${counts.degraded})`, value: 'degraded', key: 'degraded', count: counts.degraded },
      { label: `Unhealthy (${counts.unhealthy})`, value: 'unhealthy', key: 'unhealthy', count: counts.unhealthy },
    ];
  }, [normalizedTopologyNodes]);

  return {
    topologyLoading,
    topologyError,
    topologyNodes,
    topologyEdges,
    topologyStats,
    criticalServices,
    dependencyRows,
    healthOptions,
  };
}
