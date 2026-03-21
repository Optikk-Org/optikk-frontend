import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Tabs } from '@/components/ui';
import { Palette, Settings, User, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { z } from 'zod';

import { settingsService } from '@shared/api/settingsService';
import { PageHeader, PageShell } from '@shared/components/ui';

import { useAppStore } from '@/shared/store/appStore';

import {
  SettingsPreferencesTab,
  SettingsProfileTab,
  SettingsTeamTab,
} from '../../components/tabs';

import type {
  SettingsPreferenceValue,
  SettingsProfileCommand,
  SettingsProfileFormValues,
  SettingsProfileViewModel,
} from '../../types';


const settingsProfileQueryKey = ['settings-profile'] as const;

const optionalTextSchema = z.preprocess((value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().optional());

const settingsTeamSchema = z.object({
  name: z.string().optional(),
  apiKey: z.string().optional(),
  role: z.string().optional(),
}).passthrough();

const settingsProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  avatarUrl: z.string().optional(),
  role: z.string().optional(),
  teams: z.array(settingsTeamSchema).optional(),
}).passthrough();

const profileCommandSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name'),
  avatarUrl: optionalTextSchema,
});

const preferenceValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
]);

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function parseProfileResponse(response: unknown): SettingsProfileViewModel {
  const parsed = settingsProfileSchema.safeParse(response);
  if (!parsed.success) {
    throw new Error('Invalid profile response');
  }

  return parsed.data;
}

function toProfileCommand(values: SettingsProfileFormValues): SettingsProfileCommand | null {
  const parsed = profileCommandSchema.safeParse(values);
  if (!parsed.success) {
    toast.error(parsed.error.issues[0]?.message ?? 'Please check the profile form');
    return null;
  }

  return parsed.data;
}

/**
 * Settings page container that coordinates profile/preferences/team tabs.
 */
export default function SettingsPage(): JSX.Element {
  const queryClient = useQueryClient();
  const [activeSettingsTab, setActiveSettingsTab] = useState('profile');

  const {
    theme,
    notificationsEnabled,
    viewPreferences,
    setTheme,
    setNotificationsEnabled,
    setViewPreference,
  } = useAppStore();

  const { data: profileData, isLoading: profileLoading } = useQuery<SettingsProfileViewModel>({
    queryKey: settingsProfileQueryKey,
    queryFn: async () => parseProfileResponse(await settingsService.getProfile()),
  });

  const profile = profileData ?? null;
  const teams = profile?.teams ?? [];
  const normalizedPreferences = viewPreferences;

  const updateProfileMutation = useMutation({
    mutationFn: (command: SettingsProfileCommand) => settingsService.updateProfile(command),
    onMutate: async (newProfile) => {
      await queryClient.cancelQueries({ queryKey: settingsProfileQueryKey });
      const previousProfile =
        queryClient.getQueryData<SettingsProfileViewModel>(settingsProfileQueryKey);

      queryClient.setQueryData<SettingsProfileViewModel>(settingsProfileQueryKey, (old) => ({
        ...(old ?? {}),
        ...newProfile,
      }));

      return { previousProfile };
    },
    onError: (error: unknown, _newProfile, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(settingsProfileQueryKey, context.previousProfile);
      }

      toast.error(getErrorMessage(error, 'Failed to update profile'));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: settingsProfileQueryKey });
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (preferences: Record<string, SettingsPreferenceValue>) =>
      settingsService.updatePreferences(preferences),
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'Failed to sync preferences'));
    },
  });

  const handleProfileSubmit = (values: SettingsProfileFormValues): void => {
    const command = toProfileCommand(values);
    if (!command) {
      return;
    }

    updateProfileMutation.mutate(command);
  };

  const handleThemeChange = (checked: boolean): void => {
    const newTheme = checked ? 'dark' : 'light';
    setTheme(newTheme);
    updatePreferencesMutation.mutate({ theme: newTheme });
    toast.success(`Switched to ${newTheme} theme`);
  };

  const handleNotificationsChange = (checked: boolean): void => {
    setNotificationsEnabled(checked);
    updatePreferencesMutation.mutate({ notificationsEnabled: checked });
    toast.success(`Notifications ${checked ? 'enabled' : 'disabled'}`);
  };

  const handlePreferenceChange = (key: string, value: SettingsPreferenceValue): void => {
    const parsedValue = preferenceValueSchema.safeParse(value);
    if (!parsedValue.success) {
      toast.error('Unsupported preference value');
      return;
    }

    setViewPreference(key, parsedValue.data);
    updatePreferencesMutation.mutate({ [key]: parsedValue.data });
    toast.success('Preference updated');
  };

  const getInitials = (name: string): string => {
    if (!name) {
      return 'U';
    }

    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <PageShell className="min-h-screen">
      <PageHeader title="Settings" icon={<Settings size={24} />} />

      <Tabs
        activeKey={activeSettingsTab}
        onChange={setActiveSettingsTab}
        className="mt-1"
        items={[
          { key: 'profile', label: 'Profile', icon: <User size={14} /> },
          { key: 'preferences', label: 'Preferences', icon: <Palette size={14} /> },
          { key: 'team', label: 'Team', icon: <Users size={14} /> },
        ]}
      />

      {activeSettingsTab === 'profile' && (
        <SettingsProfileTab
          profileLoading={profileLoading}
          profile={profile}
          isSaving={updateProfileMutation.isPending}
          getInitials={getInitials}
          onSubmit={handleProfileSubmit}
        />
      )}

      {activeSettingsTab === 'preferences' && (
        <SettingsPreferencesTab
          theme={theme}
          notificationsEnabled={notificationsEnabled}
          viewPreferences={normalizedPreferences}
          onThemeChange={handleThemeChange}
          onNotificationsChange={handleNotificationsChange}
          onPreferenceChange={handlePreferenceChange}
        />
      )}

      {activeSettingsTab === 'team' && (
        <SettingsTeamTab profileLoading={profileLoading} teams={teams} />
      )}
    </PageShell>
  );
}
