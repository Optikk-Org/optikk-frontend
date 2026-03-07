import { z } from 'zod';
import type { LogId } from '@shared/types/branded';

export const logEntrySchema = z.object({
  id: z.string().brand<'LogId'>(),
  timestamp: z.string(),
  level: z.string(),
  message: z.string(),
  service: z.string(),
}).passthrough();

export type LogEntry = z.infer<typeof logEntrySchema>;
