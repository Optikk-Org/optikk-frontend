export const metricsKeys = {
  all: ['metrics'] as const,
  summary: (teamId: number | null, range: string) => ['metrics', 'summary', teamId, range] as const,
  timeseries: (teamId: number | null, range: string, serviceName?: string | null) =>
    ['metrics', 'timeseries', teamId, range, serviceName || 'all'] as const,
};
