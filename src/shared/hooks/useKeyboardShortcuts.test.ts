import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useKeyboardShortcuts } from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  it('exposes the expected global shortcut definitions', () => {
    const { result } = renderHook(() => useKeyboardShortcuts());

    expect(result.current.shortcuts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'command-palette',
          keys: ['Ctrl', 'K'],
        }),
        expect.objectContaining({
          id: 'shortcut-help',
          keys: ['?'],
        }),
      ]),
    );
  });
});
