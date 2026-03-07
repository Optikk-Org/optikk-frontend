import { useMemo } from 'react';

const FEATURE_PREFIX = 'VITE_FEATURE_';

function readFlag(flagName: string): boolean {
  const envKey = `${FEATURE_PREFIX}${flagName}`;
  const raw = (import.meta.env[envKey] as string | boolean | undefined);

  if (typeof raw === 'boolean') {
    return raw;
  }

  if (typeof raw === 'string') {
    return ['1', 'true', 'on', 'enabled', 'yes'].includes(raw.toLowerCase());
  }

  return false;
}

/**
 *
 */
export function useFeatureFlag(flagName: string): boolean {
  return useMemo(() => readFlag(flagName), [flagName]);
}
