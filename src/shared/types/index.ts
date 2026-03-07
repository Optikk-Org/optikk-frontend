export * from './api';
export * from './branded';
export * from './common';
export * from './dashboardConfig';

export interface TimeRange {
  label: string;
  value: string;
  minutes?: number;
  start?: number;
  end?: number;
  startTime?: string | number;
  endTime?: string | number;
}

export interface Team {
  id: number;
  name: string;
  orgName?: string;
  [key: string]: unknown;
}

export interface User {
  id: string | number;
  email: string;
  name?: string;
  teams?: Team[];
  [key: string]: unknown;
}
