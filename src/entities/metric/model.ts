import { z } from 'zod';

export const metricDataSchema = z.object({
  timestamp: z.string(),
  value: z.number(),
}).passthrough();

export type MetricData = z.infer<typeof metricDataSchema>;
