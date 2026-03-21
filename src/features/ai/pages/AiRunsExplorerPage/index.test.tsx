import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import AiRunsExplorerPage from './index';

vi.mock('../../hooks/useAiRunsExplorer', () => ({
  useAiRunsExplorer: vi.fn(() => ({
    isLoading: false,
    runs: [
      {
        spanId: 'run-1',
        model: 'gpt-4.1',
        operationType: 'chat',
        serviceName: 'assistant-api',
        durationMs: 420,
        totalTokens: 1200,
        inputTokens: 900,
        outputTokens: 300,
        hasError: false,
        startTime: '2026-03-20T12:00:00Z',
        operationName: 'assistant.generate',
        provider: 'openai',
      },
    ],
    pageSize: 50,
    filters: [],
    runsError: null,
    summaryError: null,
    modelsError: null,
    operationsError: null,
    hasError: false,
    primaryError: null,
    setPageSize: vi.fn(),
    setFilters: vi.fn(),
    clearAll: vi.fn(),
  })),
}));

describe('AiRunsExplorerPage', () => {
  it('renders the runs explorer with the shared query shell', () => {
    render(
      <MemoryRouter initialEntries={['/ai/runs']}>
        <AiRunsExplorerPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'LLM Runs' })).toBeInTheDocument();
    expect(screen.getByText('Runs Explorer')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Filter LLM runs by model, operation, provider, service, or status').closest('div'),
    ).toHaveClass(
      'rounded-[14px]',
      'min-h-[48px]',
      'bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.78))]',
    );
    expect(screen.getByText('LLM Run Explorer')).toBeInTheDocument();
  });
});
