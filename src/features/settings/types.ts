/** Generic record shape used for settings payloads and view data. */
export type DomainRecord = Record<string, unknown>;

/** Lightweight team summary shown in the settings team tab. */
export interface SettingsTeamViewModel {
  readonly name?: string;
  readonly apiKey?: string;
  readonly role?: string;
}

/** Normalized settings profile data rendered by the settings page. */
export interface SettingsProfileViewModel {
  readonly name?: string;
  readonly email?: string;
  readonly avatarUrl?: string;
  readonly role?: string;
  readonly teams?: SettingsTeamViewModel[];
}

/** Shared preferences stored for the current user. */
export interface SettingsViewPreferences {
  readonly defaultTimeRange?: string;
  readonly defaultPageSize?: number;
  readonly [key: string]: unknown;
}

/** Form values collected from the profile editor. */
export interface SettingsProfileFormValues {
  readonly name: string;
  readonly email?: string;
  readonly avatarUrl?: string;
}

/** Command payload submitted when saving the profile form. */
export interface SettingsProfileCommand extends Record<string, unknown> {
  readonly name: string;
  readonly avatarUrl?: string;
}

/** Allowed preference value primitives accepted by the settings page. */
export type SettingsPreferenceValue = string | number | boolean;
