import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import MainLayout from './MainLayout';

vi.mock('./Header', () => ({
  default: () => <div>Header</div>,
}));

vi.mock('./Sidebar', () => ({
  default: () => <div>Sidebar</div>,
}));

vi.mock('@shared/components/ui/overlay/CommandPalette', () => ({
  default: () => null,
}));

vi.mock('@shared/components/ui/overlay/ShortcutHelpOverlay', () => ({
  default: () => null,
}));

vi.mock('@/components/ui/providers/DensityProvider', () => ({
  DensityProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('@shared/hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: () => ({ shortcuts: [] }),
}));

vi.mock('@store/appStore', () => ({
  useAppStore: (selector: (state: { sidebarCollapsed: boolean }) => boolean) =>
    selector({ sidebarCollapsed: false }),
}));

describe('MainLayout', () => {
  it('does not render the AI context quick links globally', () => {
    render(
      <MemoryRouter initialEntries={['/logs']}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/logs" element={<div>Logs Child</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Logs Child')).toBeInTheDocument();
    expect(screen.queryByText('AI Observability')).not.toBeInTheDocument();
    expect(screen.queryByText('Runs Explorer')).not.toBeInTheDocument();
  });
});
