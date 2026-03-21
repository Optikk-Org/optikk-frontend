import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ObservabilityQueryBar from './ObservabilityQueryBar';
import {
  EXPLORER_QUERY_DROPDOWN_CLASSNAME,
  EXPLORER_QUERY_WRAPPER_CLASSNAME,
} from './explorerQueryShell';

describe('ObservabilityQueryBar', () => {
  it('opens an elevated field picker dropdown from the query input', () => {
    const setFilters = vi.fn();
    const setSearchText = vi.fn();
    const onClearAll = vi.fn();

    const { container } = render(
      <ObservabilityQueryBar
        fields={[
          {
            key: 'service_name',
            label: 'Service',
            group: 'Service',
            operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
          },
        ]}
        filters={[]}
        setFilters={setFilters}
        searchText=""
        setSearchText={setSearchText}
        onClearAll={onClearAll}
        placeholder="Search traces"
      />,
    );

    fireEvent.focus(screen.getByPlaceholderText('Search traces'));

    expect(screen.getByText('Filter by field')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass(...EXPLORER_QUERY_WRAPPER_CLASSNAME.split(' '));
    expect(container.firstChild?.firstChild).toHaveClass(
      'rounded-[14px]',
      'min-h-[48px]',
      'bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.78))]',
    );
    expect(screen.getByText('Filter by field').closest('div')?.parentElement).toHaveClass(...EXPLORER_QUERY_DROPDOWN_CLASSNAME.split(' '));
  });
});
