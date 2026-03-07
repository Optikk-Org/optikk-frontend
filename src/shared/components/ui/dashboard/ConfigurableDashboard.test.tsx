import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { DashboardComponentSpec, DashboardRenderConfig } from '@/types/dashboardConfig';

import ConfigurableDashboard from './ConfigurableDashboard';

import type { ReactNode } from 'react';

vi.mock('antd', () => ({
  Col: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Row: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Spin: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('./ConfigurableChartCard', () => ({
  default: ({ componentConfig }: { componentConfig: DashboardComponentSpec }) => (
    <div data-testid="dashboard-component">{componentConfig.componentKey}</div>
  ),
}));

describe('ConfigurableDashboard', () => {
  it('renders only components returned by backend config', () => {
    const config: DashboardRenderConfig = {
      components: [
        { id: 'requests', componentKey: 'request', title: 'Requests', order: 10, query: { method: 'GET', endpoint: '/v1/requests' } },
        { id: 'latency', componentKey: 'latency', title: 'Latency', order: 20, query: { method: 'GET', endpoint: '/v1/latency' } },
      ],
    };

    render(
      <ConfigurableDashboard
        config={config}
        dataSources={{}}
      />,
    );

    const rendered = screen.getAllByTestId('dashboard-component');
    expect(rendered).toHaveLength(2);
    expect(screen.getByText('request')).toBeInTheDocument();
    expect(screen.getByText('latency')).toBeInTheDocument();
    expect(screen.queryByText('error-rate')).not.toBeInTheDocument();
  });

  it('does not render frontend fallback components when backend list is empty', () => {
    const config: DashboardRenderConfig = {
      components: [],
    };

    render(
      <ConfigurableDashboard
        config={config}
        dataSources={{}}
      />,
    );

    expect(screen.queryByTestId('dashboard-component')).not.toBeInTheDocument();
  });
});
