export /**
 *
 */
const infrastructureKeys = {
  all: ['infrastructure'] as const,
  nodes: (teamId: number | null, range: string) =>
    ['infrastructure', 'nodes', teamId, range] as const,
};
