import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { TimeRange } from '@/types';

import { STORAGE_KEYS, TIME_RANGES } from '@config/constants';

interface ViewPreferences {
  theme?: 'light' | 'dark' | 'system';
  timezone?: string;
  refreshInterval?: number;
  sidebarCollapsed?: boolean;
  density?: 'compact' | 'comfortable';
  [key: string]: unknown;
}

interface PersistedAppState {
  readonly selectedTeamId: number | null;
  readonly selectedTeamIds: number[];
  readonly timeRange: TimeRange;
  readonly sidebarCollapsed: boolean;
  readonly autoRefreshInterval: number;
  readonly theme: string;
  readonly notificationsEnabled: boolean;
  readonly viewPreferences: ViewPreferences;
}

interface AppState extends PersistedAppState {
  readonly refreshKey: number;
  readonly setSelectedTeamId: (teamId: number | null) => void;
  readonly setSelectedTeamIds: (teamIds: number[]) => void;
  readonly setTimeRange: (valueOrRange: string | TimeRange) => void;
  readonly setCustomTimeRange: (customRange: TimeRange) => void;
  readonly toggleSidebar: () => void;
  readonly triggerRefresh: () => void;
  readonly setAutoRefreshInterval: (ms: number) => void;
  readonly setTheme: (theme: string) => void;
  readonly setNotificationsEnabled: (enabled: boolean) => void;
  readonly setViewPreference: (key: string, value: unknown) => void;
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function readLegacyJSON<T>(key: string, fallback: T): T {
  const raw = readStorage(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function asTimeRange(value: unknown): TimeRange | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  return value as TimeRange;
}

function getDefaultTimeRange(): TimeRange {
  const range = TIME_RANGES.find((candidate) => candidate.value === '1h') ?? TIME_RANGES[3];
  const parsed = asTimeRange(range);
  if (parsed) {
    return parsed;
  }
  return { label: '1h', value: '1h', minutes: 60 };
}

function findPresetTimeRange(value: string): TimeRange | null {
  return asTimeRange(TIME_RANGES.find((candidate) => candidate.value === value));
}

function resolveTimeRange(value: unknown): TimeRange {
  if (typeof value === 'string') {
    return findPresetTimeRange(value) ?? getDefaultTimeRange();
  }

  const parsed = asTimeRange(value);
  if (parsed?.value === 'custom') {
    return parsed;
  }
  if (parsed?.value) {
    return asTimeRange(TIME_RANGES.find((candidate) => candidate.value === parsed.value)) ?? parsed;
  }

  return getDefaultTimeRange();
}

function readLegacyTeamIDs(): number[] {
  const raw = readStorage(STORAGE_KEYS.TEAM_IDS);
  if (!raw) {
    return [];
  }

  return raw
    .split(',')
    .map(Number)
    .filter((teamId) => Number.isFinite(teamId) && teamId > 0);
}

function loadLegacyAppState(): PersistedAppState {
  const selectedTeamIdRaw = readStorage(STORAGE_KEYS.TEAM_ID);
  const selectedTeamId =
    selectedTeamIdRaw && Number.isFinite(Number(selectedTeamIdRaw))
      ? Number(selectedTeamIdRaw)
      : null;
  const selectedTeamIds = readLegacyTeamIDs();

  return {
    selectedTeamId,
    selectedTeamIds:
      selectedTeamIds.length > 0 ? selectedTeamIds : selectedTeamId != null ? [selectedTeamId] : [],
    timeRange: resolveTimeRange(readStorage(STORAGE_KEYS.TIME_RANGE)),
    sidebarCollapsed: readStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true',
    autoRefreshInterval: Number(readStorage(STORAGE_KEYS.AUTO_REFRESH) ?? '10000') || 10_000,
    theme: readStorage(STORAGE_KEYS.THEME) ?? 'dark',
    notificationsEnabled: readStorage(STORAGE_KEYS.NOTIFICATIONS) !== 'false',
    viewPreferences: readLegacyJSON<ViewPreferences>(STORAGE_KEYS.VIEW_PREFS, {}),
  };
}

function initialState(): PersistedAppState {
  return loadLegacyAppState();
}

const defaultPersistedState = initialState();

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...defaultPersistedState,
      refreshKey: 0,

      setSelectedTeamId: (teamId: number | null): void => {
        set({
          selectedTeamId: teamId,
          selectedTeamIds: teamId != null ? [teamId] : [],
        });
      },

      setSelectedTeamIds: (teamIds: number[]): void => {
        const primary = teamIds[0] ?? null;
        set({
          selectedTeamIds: teamIds,
          selectedTeamId: primary,
        });
      },

      setTimeRange: (valueOrRange: string | TimeRange): void => {
        if (typeof valueOrRange === 'string') {
          const range = findPresetTimeRange(valueOrRange);
          if (!range) {
            return;
          }

          set((state) => ({ timeRange: range, refreshKey: state.refreshKey + 1 }));
          return;
        }

        const range = resolveTimeRange(valueOrRange.value);
        set((state) => ({ timeRange: range, refreshKey: state.refreshKey + 1 }));
      },

      setCustomTimeRange: (customRange: TimeRange): void => {
        set((state) => ({ timeRange: customRange, refreshKey: state.refreshKey + 1 }));
      },

      toggleSidebar: (): void => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      triggerRefresh: (): void => {
        set((state) => ({ refreshKey: state.refreshKey + 1 }));
      },

      setAutoRefreshInterval: (ms: number): void => {
        set({ autoRefreshInterval: ms });
      },

      setTheme: (theme: string): void => {
        set({ theme });
      },

      setNotificationsEnabled: (enabled: boolean): void => {
        set({ notificationsEnabled: enabled });
      },

      setViewPreference: (key: string, value: unknown): void => {
        set((state) => ({
          viewPreferences: { ...state.viewPreferences, [key]: value },
        }));
      },
    }),
    {
      name: STORAGE_KEYS.APP_STATE,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedAppState => ({
        selectedTeamId: state.selectedTeamId,
        selectedTeamIds: state.selectedTeamIds,
        timeRange: state.timeRange,
        sidebarCollapsed: state.sidebarCollapsed,
        autoRefreshInterval: state.autoRefreshInterval,
        theme: state.theme,
        notificationsEnabled: state.notificationsEnabled,
        viewPreferences: state.viewPreferences,
      }),
      merge: (persisted, current) => {
        const snapshot = persisted as Partial<PersistedAppState> | undefined;
        if (!snapshot) {
          return current;
        }

        return {
          ...current,
          ...snapshot,
          timeRange: resolveTimeRange(snapshot.timeRange),
          selectedTeamIds: snapshot.selectedTeamIds ?? current.selectedTeamIds,
          selectedTeamId: snapshot.selectedTeamId ?? current.selectedTeamId,
          viewPreferences: snapshot.viewPreferences ?? current.viewPreferences,
        };
      },
    }
  )
);
