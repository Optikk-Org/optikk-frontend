import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import TraceComparisonPage from './index';

vi.mock('@shared/api/tracesService', () => ({
  tracesService: {
    getTraceComparison: vi.fn(),
  },
}));

function renderPage(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/traces/compare" element={<TraceComparisonPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('TraceComparisonPage', () => {
  it('shows a selection hint when trace ids are missing', () => {
    renderPage('/traces/compare');

    expect(
      screen.getByText(/Select exactly two traces from the explorer/i),
    ).toBeInTheDocument();
  });
});
