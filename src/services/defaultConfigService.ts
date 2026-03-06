import { API_CONFIG } from '@config/apiConfig';
import type {
  DashboardComponentSpec,
  DefaultConfigPage,
  DefaultConfigTab,
} from '@/types/dashboardConfig';

import api from './api';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

export const defaultConfigService = {
  async listPages(_teamId: number | null): Promise<DefaultConfigPage[]> {
    const response = await api.get(`${BASE}/default-config/pages`) as { pages?: DefaultConfigPage[] };
    return Array.isArray(response.pages) ? response.pages : [];
  },

  async listPageTabs(_teamId: number | null, pageId: string): Promise<DefaultConfigTab[]> {
    const response = await api.get(`${BASE}/default-config/pages/${pageId}/tabs`) as {
      tabs?: DefaultConfigTab[];
    };
    return Array.isArray(response.tabs) ? response.tabs : [];
  },

  async listTabComponents(
    _teamId: number | null,
    pageId: string,
    tabId: string,
  ): Promise<DashboardComponentSpec[]> {
    const response = await api.get(
      `${BASE}/default-config/pages/${pageId}/tabs/${tabId}/components`,
    ) as {
      components?: DashboardComponentSpec[];
    };
    return Array.isArray(response.components) ? response.components : [];
  },

  async savePageOverride(
    _teamId: number | null,
    pageId: string,
    payload: Record<string, unknown>,
  ): Promise<unknown> {
    return api.put(`${BASE}/default-config/pages/${pageId}`, payload);
  },
};
