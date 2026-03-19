import { format } from 'date-fns';
import { parseTimestampMs } from '@shared/utils/logUtils';
import { formatRelativeTime } from '@shared/utils/formatters';

const EMPTY_LABEL = '—';

/**
 * Formats a timestamp into "YYYY-MM-DD HH:mm:ss".
 * @param value Timestamp-like value.
 */
export function tsLabel(value: unknown): string {
  const ms = parseTimestampMs(value);
  if (!ms) return EMPTY_LABEL;
  return format(new Date(ms), 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Formats a timestamp into relative time (e.g. "5m ago").
 * @param value Timestamp-like value.
 * @deprecated Use `formatRelativeTime` from `@shared/utils/formatters` directly.
 */
export function relativeTime(value: unknown): string {
  const ms = parseTimestampMs(value);
  if (!ms) return '';
  return formatRelativeTime(ms);
}
