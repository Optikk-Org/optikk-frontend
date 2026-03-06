export const overviewKeys = {
  all: ['overview'] as const,
  summary: (teamId: number | null, range: string) => ['overview', 'summary', teamId, range] as const,
};
