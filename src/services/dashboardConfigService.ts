/**
 * Dashboard Config Service — API calls for dashboard chart YAML configurations.
 *
 * Each "page" (e.g. 'overview', 'metrics', 'saturation') has a YAML config that
 * defines which charts to render, their layout, data sources, and display options.
 * Teams can override the built-in defaults via saveDashboardConfig().
 */
import api from './api';
import { API_CONFIG } from '@config/constants';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

export const dashboardConfigService = {
    async getDashboardConfig(teamId: number | null, pageId: string): Promise<any> {
        return api.get(`${BASE}/dashboard-config/${pageId}`);
    },

    async saveDashboardConfig(teamId: number | null, pageId: string, configYaml: string): Promise<any> {
        return api.put(`${BASE}/dashboard-config/${pageId}`, { configYaml });
    },

    async listDashboardPages(teamId: number | null): Promise<any> {
        return api.get(`${BASE}/dashboard-config/pages`);
    },
};
