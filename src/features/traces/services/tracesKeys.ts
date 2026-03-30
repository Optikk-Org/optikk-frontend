export /**
 *
 */
const tracesKeys = {
  all: ['traces'] as const,
  list: (teamId: number | null, range: string) => ['traces', 'list', teamId, range] as const,
  detail: (teamId: number | null, traceId: string) =>
    ['traces', 'detail', teamId, traceId] as const,
};
