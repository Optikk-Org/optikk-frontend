import { create } from 'zustand';
import { STORAGE_KEYS, TIME_RANGES } from '@config/constants';
import { safeGet, safeSet, safeGetJSON, safeSetJSON } from '@utils/storage';
import { TimeRange } from '@/types';

interface ViewPreferences {
  [key: string]: any;
}

const defaultTimeRange = TIME_RANGES.find((r) => r.value === '1h') || TIME_RANGES[3];

const savedTeamId = safeGet(STORAGE_KEYS.TEAM_ID);
const savedTimeRange = safeGet(STORAGE_KEYS.TIME_RANGE);
const savedCollapsed = safeGet(STORAGE_KEYS.SIDEBAR_COLLAPSED);
const savedAutoRefresh = safeGet(STORAGE_KEYS.AUTO_REFRESH);

interface AppState {
  selectedTeamId: number | null;
  timeRange: TimeRange;
  sidebarCollapsed: boolean;
  refreshKey: number;
  autoRefreshInterval: number;
  theme: string;
  notificationsEnabled: boolean;
  viewPreferences: ViewPreferences;
  setSelectedTeamId: (teamId: number | null) => void;
  setTimeRange: (valueOrRange: string | TimeRange) => void;
  setCustomTimeRange: (customRange: TimeRange) => void;
  toggleSidebar: () => void;
  triggerRefresh: () => void;
  setAutoRefreshInterval: (ms: number) => void;
  setTheme: (theme: string) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setViewPreference: (key: string, value: any) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Default to null instead of 1 — forces team selection rather than
  // silently falling through to a potentially valid team ID.
  selectedTeamId: savedTeamId ? Number(savedTeamId) : null,
  timeRange: savedTimeRange
    ? (TIME_RANGES.find((r) => r.value === savedTimeRange) || defaultTimeRange) as TimeRange
    : defaultTimeRange as TimeRange,
  sidebarCollapsed: savedCollapsed === 'true',
  refreshKey: 0,
  autoRefreshInterval: savedAutoRefresh !== null ? Number(savedAutoRefresh) : 10_000,
  theme: safeGet(STORAGE_KEYS.THEME, 'dark'),
  notificationsEnabled: safeGet(STORAGE_KEYS.NOTIFICATIONS) !== 'false',
  viewPreferences: safeGetJSON(STORAGE_KEYS.VIEW_PREFS, {}),

  setSelectedTeamId: (teamId) => {
    if (teamId !== null) {
      safeSet(STORAGE_KEYS.TEAM_ID, String(teamId));
    } else {
      safeSet(STORAGE_KEYS.TEAM_ID, '');
    }
    set({ selectedTeamId: teamId });
  },

  setTimeRange: (valueOrRange) => {
    const val = typeof valueOrRange === 'string' ? valueOrRange : valueOrRange?.value;
    const range = TIME_RANGES.find((r) => r.value === val);
    if (range) {
      safeSet(STORAGE_KEYS.TIME_RANGE, range.value);
      // Bump refreshKey so every useTimeRangeQuery refetches with fresh timestamps
      set((state) => ({ timeRange: range as TimeRange, refreshKey: state.refreshKey + 1 }));
    }
  },

  // Custom absolute time range with explicit start/end timestamps
  setCustomTimeRange: (customRange) => {
    safeSet(STORAGE_KEYS.TIME_RANGE, 'custom');
    set((state) => ({ timeRange: customRange, refreshKey: state.refreshKey + 1 }));
  },

  toggleSidebar: () => {
    set((state) => {
      const newVal = !state.sidebarCollapsed;
      safeSet(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(newVal));
      return { sidebarCollapsed: newVal };
    });
  },

  triggerRefresh: () => {
    set((state) => ({ refreshKey: state.refreshKey + 1 }));
  },

  setAutoRefreshInterval: (ms) => {
    safeSet(STORAGE_KEYS.AUTO_REFRESH, String(ms));
    set({ autoRefreshInterval: ms });
  },

  setTheme: (theme) => {
    safeSet(STORAGE_KEYS.THEME, theme);
    set({ theme });
  },

  setNotificationsEnabled: (enabled) => {
    safeSet(STORAGE_KEYS.NOTIFICATIONS, String(enabled));
    set({ notificationsEnabled: enabled });
  },

  setViewPreference: (key, value) => {
    set((state) => {
      const updated = { ...state.viewPreferences, [key]: value };
      safeSetJSON(STORAGE_KEYS.VIEW_PREFS, updated);
      return { viewPreferences: updated };
    });
  },
}));
