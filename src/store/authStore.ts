import { create } from 'zustand';
import { authService } from '@services/authService';
import { useAppStore } from '@store/appStore';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: authService.getCurrentUser() as User | null,
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const payload = await authService.login(email, password);
      if (payload?.token && payload?.user) {
        const userData: User = {
          ...payload.user,
          teams: payload.teams || payload.user?.teams || [],
        };
        const teamId = payload.currentTeam?.id
          ?? payload.teams?.[0]?.id
          ?? payload.user?.teams?.[0]?.id
          ?? null;

        if (teamId != null) {
          useAppStore.getState().setSelectedTeamId(teamId);
        }

        set({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return { success: true };
      } else {
        const msg = 'Login failed';
        set({ isLoading: false, error: msg });
        return { success: false, error: msg };
      }
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      set({ isLoading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  logout: async () => {
    await authService.logout();
    useAppStore.setState({ selectedTeamId: null });
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
