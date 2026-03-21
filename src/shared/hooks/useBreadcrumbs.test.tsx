import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { useBreadcrumbs } from './useBreadcrumbs';

function BreadcrumbProbe() {
  const crumbs = useBreadcrumbs();

  return (
    <div>
      {crumbs.map((crumb) => (
        <span key={`${String(crumb.label)}-${crumb.path ?? 'leaf'}`}>
          {crumb.label}
        </span>
      ))}
    </div>
  );
}

describe('useBreadcrumbs', () => {
  it('builds route-aware breadcrumbs for trace comparison pages', () => {
    render(
      <MemoryRouter initialEntries={['/traces/compare']}>
        <BreadcrumbProbe />
      </MemoryRouter>,
    );

    expect(screen.getByText('Traces')).toBeInTheDocument();
    expect(screen.getByText('Compare')).toBeInTheDocument();
  });

});
