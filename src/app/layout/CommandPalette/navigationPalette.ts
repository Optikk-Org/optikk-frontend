import { PaletteAction } from '@/app/layout/CommandPalette/types';

export const navigationPaletteActions: PaletteAction[] = [
  {
    id: 'nav.home',
    label: 'Go to Overview',
    keywords: ['home', 'overview', 'dashboard'],
    group: 'navigation',
    hotkey: 'g h',
    perform: () => {
      window.location.href = '/overview';
    },
  },
];
