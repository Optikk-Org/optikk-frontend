import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DashboardComponentSpec } from '@/types/dashboardConfig';

vi.mock('@shared/components/ui/charts/time-series/RequestChart', () => ({
  default: ({ data }: { data?: Array<Record<string, unknown>> }) => (
    <div data-testid="request-chart">{Array.isArray(data) ? data.length : 0}</div>
  ),
}));

import ConfigurableChartCard from './ConfigurableChartCard';

describe('ConfigurableChartCard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles unknown backend component keys gracefully', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const componentConfig: DashboardComponentSpec = {
      id: 'unknown-key-card',
      componentKey: 'does-not-exist',
      title: 'Unknown',
      order: 10,
      query: { method: 'GET', endpoint: '/v1/unknown' },
    };

    render(
      <ConfigurableChartCard
        componentConfig={componentConfig}
        dataSources={{}}
        extraContext={{}}
      />,
    );

    expect(screen.getByText(/Unknown dashboard component key:/)).toBeInTheDocument();
    expect(screen.getByText(/does-not-exist/)).toBeInTheDocument();
    expect(warnSpy).toHaveBeenCalledWith(
      'Unknown dashboard component key received from backend: does-not-exist',
    );
  });

  it('passes rows through when the datasource is already an array', () => {
    const componentConfig: DashboardComponentSpec = {
      id: 'request-rate',
      componentKey: 'request',
      title: 'Requests',
      order: 10,
      query: { method: 'GET', endpoint: '/v1/overview/request-rate' },
    };

    render(
      <ConfigurableChartCard
        componentConfig={componentConfig}
        dataSources={{
          'request-rate': [
            { timestamp: '2026-03-20T20:20:00Z', request_count: 1 },
            { timestamp: '2026-03-20T20:21:00Z', request_count: 2 },
          ],
        }}
        extraContext={{}}
      />,
    );

    expect(screen.getByTestId('request-chart')).toHaveTextContent('2');
  });

  it('passes nested data rows through when the datasource shape is { data: [...] }', () => {
    const componentConfig: DashboardComponentSpec = {
      id: 'request-rate',
      componentKey: 'request',
      title: 'Requests',
      order: 10,
      query: { method: 'GET', endpoint: '/v1/overview/request-rate' },
    };

    render(
      <ConfigurableChartCard
        componentConfig={componentConfig}
        dataSources={{
          'request-rate': {
            data: [
              { timestamp: '2026-03-20T20:20:00Z', request_count: 1 },
              { timestamp: '2026-03-20T20:21:00Z', request_count: 2 },
              { timestamp: '2026-03-20T20:22:00Z', request_count: 3 },
            ],
          },
        }}
        extraContext={{}}
      />,
    );

    expect(screen.getByTestId('request-chart')).toHaveTextContent('3');
  });
});
