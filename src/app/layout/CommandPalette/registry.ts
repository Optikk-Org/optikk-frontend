import { tracePaletteActions } from '@/features/traces/palette';
import { metricsPaletteActions } from '@/features/metrics/palette';
import { logsPaletteActions } from '@/features/log/palette';
import { navigationPaletteActions } from './navigationPalette';

export const allActions = [
  ...navigationPaletteActions,
  ...tracePaletteActions,
  ...metricsPaletteActions,
  ...logsPaletteActions,
];
