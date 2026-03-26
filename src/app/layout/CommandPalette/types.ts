import React from 'react';

export interface PaletteAction {
  id: string; // unique, stable - used for hotkey binding
  label: string; // displayed in palette
  keywords: string[]; // search terms
  icon?: React.ReactNode;
  group: 'navigation' | 'time' | 'feature' | 'settings';
  hotkey?: string; // optional direct hotkey e.g. 'g t' for go to traces
  perform: () => void; // the actual action
  enabled?: () => boolean; // conditional visibility
}
