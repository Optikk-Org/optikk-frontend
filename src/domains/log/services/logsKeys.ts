export const logsKeys = {
  all: ['logs'] as const,
  list: (teamId: number | null, range: string, queryHash: string) =>
    ['logs', 'list', teamId, range, queryHash] as const,
  stats: (teamId: number | null, range: string, queryHash: string) =>
    ['logs', 'stats', teamId, range, queryHash] as const,
};
