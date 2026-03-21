import { describe, expect, it } from 'vitest';

import { normalizeDashboardRows } from './dashboardAggregators';

describe('normalizeDashboardRows', () => {
  it('returns the raw array when dataKey is not provided', () => {
    const rows = [{ value: 1 }, { value: 2 }];
    expect(normalizeDashboardRows(rows)).toEqual(rows);
  });

  it('returns nested data rows when rawData uses the backend { data: [...] } shape', () => {
    const rows = [{ value: 1 }, { value: 2 }];
    expect(normalizeDashboardRows({ data: rows })).toEqual(rows);
  });

  it('returns the keyed array when dataKey is provided', () => {
    const rows = [{ value: 1 }];
    expect(normalizeDashboardRows({ series: rows }, 'series')).toEqual(rows);
  });

  it('returns an empty array for malformed shapes', () => {
    expect(normalizeDashboardRows({})).toEqual([]);
    expect(normalizeDashboardRows({ data: null })).toEqual([]);
    expect(normalizeDashboardRows({ series: 'nope' }, 'series')).toEqual([]);
  });
});
