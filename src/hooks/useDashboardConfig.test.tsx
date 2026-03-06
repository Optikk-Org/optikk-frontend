import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useDashboardConfig } from './useDashboardConfig';

vi.mock('./usePageTabs', () => ({
  usePageTabs: vi.fn(() => ({
    tabs: [{ id: 'summary', pageId: 'overview', label: 'Summary', order: 10 }],
    isLoading: false,
    error: null,
  })),
}));

vi.mock('./useTabComponents', () => ({
  useTabComponents: vi.fn(() => ({
    components: [
      {
        id: 'request-rate',
        componentKey: 'request',
        order: 10,
        query: { method: 'GET', endpoint: '/v1/overview/request-rate' },
      },
    ],
    isLoading: false,
    error: null,
  })),
}));

describe('useDashboardConfig', () => {
  it('maps the first tab components into a render config', () => {
    const { result } = renderHook(() => useDashboardConfig('overview'));

    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.config?.components).toEqual([
      expect.objectContaining({
        id: 'request-rate',
        componentKey: 'request',
        dataSource: 'request-rate',
      }),
    ]);
  });
});
