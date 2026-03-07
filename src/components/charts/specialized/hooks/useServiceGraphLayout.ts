import { useMemo } from 'react';
import { buildLayout } from './graphUtils';

export function useServiceGraphLayout(nodes: any[], edges: any[]) {
  const layout = useMemo(
    () => buildLayout(nodes, edges),
    [nodes, edges],
  );

  const maxCalls = useMemo(
    () => Math.max(...layout.edges.map((edge: any) => Number(edge.callCount || 0)), 1),
    [layout.edges],
  );

  return {
    ...layout,
    maxCalls,
  };
}
