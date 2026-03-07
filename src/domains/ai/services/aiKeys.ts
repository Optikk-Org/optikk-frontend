export /**
 *
 */
const aiKeys = {
  all: ['ai'] as const,
  summary: (teamId: number | null, range: string) => ['ai', 'summary', teamId, range] as const,
};
