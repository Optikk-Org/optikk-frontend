import { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';

import CommandPalette from '@shared/components/ui/overlay/CommandPalette';
import ShortcutHelpOverlay from '@shared/components/ui/overlay/ShortcutHelpOverlay';
import AiContextBar from '@shared/components/ui/calm/AiContextBar';
import { DensityProvider } from '@shared/design-system/providers/DensityProvider';
import { useKeyboardShortcuts } from '@shared/hooks/useKeyboardShortcuts';

import { useAppStore } from '@store/appStore';

import Header from './Header';
import Sidebar from './Sidebar';

import './MainLayout.css';

export default function MainLayout() {
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutHelpOpen, setShortcutHelpOpen] = useState(false);
  const { shortcuts } = useKeyboardShortcuts();

  const handleKeyDown = useCallback((e: KeyboardEvent): void => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCommandPaletteOpen((prev) => !prev);
      return;
    }
    // ? toggles shortcut help (when not in input)
    const target = e.target as HTMLElement;
    const tag = target.tagName;
    if (e.key === '?' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT' && !target.isContentEditable) {
      e.preventDefault();
      setShortcutHelpOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <DensityProvider>
      <div className="main-layout">
        <Sidebar />
        <div className={`main-content-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <Header />
          <AiContextBar />
          <main className="main-content">
            <Outlet />
          </main>
        </div>
        <CommandPalette
          open={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />
        <ShortcutHelpOverlay
          open={shortcutHelpOpen}
          onClose={() => setShortcutHelpOpen(false)}
          shortcuts={shortcuts}
        />
      </div>
    </DensityProvider>
  );
}
