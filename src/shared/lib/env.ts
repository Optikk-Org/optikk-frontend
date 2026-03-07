import { z } from 'zod';

/**
 * Validated environment variables schema.
 * Prevents the application from starting with invalid or missing configuration.
 */
const envSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:9090'),
  MODE: z.enum(['development', 'production', 'test']).default('development'),
  BASE_URL: z.string().default('/'),
});

const processEnv = {
  VITE_API_URL: import.meta.env['VITE_API_URL'],
  MODE: import.meta.env['MODE'],
  BASE_URL: import.meta.env['BASE_URL'],
};

const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
