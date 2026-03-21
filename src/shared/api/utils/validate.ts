import { z } from 'zod';

export function validateResponse<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  value: unknown,
): z.infer<TSchema> {
  return schema.parse(value);
}
