import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import TopEndpointsList from './TopEndpointsList';

describe('TopEndpointsList', () => {
  it('renders a drilldown link without breaking row toggle behavior', () => {
    const onToggle = vi.fn();

    render(
      <MemoryRouter>
        <TopEndpointsList
          title="Requests"
          type="requests"
          onToggle={onToggle}
          drilldownRouteTemplate="/saturation/kafka/topics/{topic}"
          endpoints={[
            {
              key: 'orders',
              endpoint: 'orders',
              topic: 'orders',
              request_count: 42,
            },
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'View' })).toHaveAttribute(
      'href',
      '/saturation/kafka/topics/orders',
    );

    fireEvent.click(screen.getByText('orders'));
    expect(onToggle).toHaveBeenCalledWith('orders');
  });
});
