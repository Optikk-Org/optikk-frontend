import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import LogsHubPage from './index';

vi.mock('@shared/hooks/useURLFilters', () => ({
  useURLFilters: vi.fn(() => ({
    values: { search: '' },
    setters: { search: vi.fn() },
    structuredFilters: [],
    setStructuredFilters: vi.fn(),
    clearAll: vi.fn(),
  })),
}));

vi.mock('../../hooks/useLogsHubData', () => ({
  useLogsHubData: vi.fn(() => ({
    logs: [
      {
        id: 'log-1',
        timestamp: '2026-03-20T12:00:00Z',
        level: 'ERROR',
        severity_text: 'ERROR',
        service_name: 'checkout-service',
        host: 'host-a',
        pod: 'checkout-1',
        message: 'checkout failed',
        body: 'checkout failed',
        trace_id: 'trace-1',
      },
    ],
    logsLoading: false,
    total: 1,
    serviceFacets: [{ value: 'checkout-service', count: 1 }],
    levelFacets: [{ value: 'ERROR', count: 1 }],
    liveTailEnabled: false,
    setLiveTailEnabled: vi.fn(),
    liveTailStatus: 'idle',
    liveTailLagMs: 0,
  })),
}));

vi.mock('../../hooks/useLogDetailFields', () => ({
  useLogDetailFields: vi.fn(() => []),
}));

describe('LogsHubPage', () => {
  it('renders an explorer-only layout without saved views or charts', () => {
    render(
      <MemoryRouter initialEntries={['/logs']}>
        <LogsHubPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Logs' })).toBeInTheDocument();
    expect(screen.getByText('Logs Explorer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start live tail/i })).toBeInTheDocument();
    expect(screen.queryByText('AI Observability')).not.toBeInTheDocument();
    expect(screen.queryByText('Runs Explorer')).not.toBeInTheDocument();
    expect(screen.queryByText('Volume Timeline')).not.toBeInTheDocument();
    expect(screen.queryByText('Service Error Rate')).not.toBeInTheDocument();
    expect(screen.queryByText(/saved views/i)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search logs, services, hosts, trace IDs, or free text').closest('div')).toHaveClass(
      'rounded-[14px]',
      'min-h-[48px]',
      'bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.78))]',
    );
  });
});
