export const servicesKeys = {
  all: ['services'] as const,
  summary: (teamId: number | null, range: string) => ['services', 'summary', teamId, range] as const,
  detail: (teamId: number | null, range: string, serviceName: string) =>
    ['services', 'detail', teamId, range, serviceName] as const,
};
