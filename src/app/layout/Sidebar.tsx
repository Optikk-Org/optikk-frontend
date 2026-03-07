import { Button, Layout, Menu } from 'antd';
import {
  Layers,
  LogOut,
  Settings,
} from 'lucide-react';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

import { getDashboardIcon } from '@shared/components/ui/dashboard/SpecializedRendererRegistry';
import { usePagesConfig } from '@/hooks/usePagesConfig';
import { ROUTES } from '@/shared/constants/routes';

import { useAppStore } from '@store/appStore';
import { useAuthStore } from '@store/authStore';

import './Sidebar.css';

const { Sider } = Layout;

/**
 *
 */
export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, theme, selectedTeamId } =
    useAppStore();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { pages } = usePagesConfig();
  const navEntries = useMemo(
    () => pages
      .filter((page) => page.navigable)
      .map((page) => ({
        path: page.path,
        label: page.label,
        group: page.group,
        iconNode: getDashboardIcon(page.icon, 18),
      })),
    [pages],
  );

  const observeItems = useMemo(
    () =>
      navEntries
        .filter((entry) => entry.group === 'observe')
        .map((entry) => {
          return {
            key: entry.path,
            icon: entry.iconNode,
            label: entry.label,
          };
        }),
    [navEntries],
  );

  const operateItems = useMemo(
    () =>
      navEntries
        .filter((entry) => entry.group === 'operate')
        .map((entry) => {
          return {
            key: entry.path,
            icon: entry.iconNode,
            label: entry.label,
          };
        }),
    [navEntries],
  );

  const mainMenuItems = useMemo(
    () => [
      {
        key: 'observe-group',
        type: 'group' as const,
        label: !sidebarCollapsed ? (
          <span className="sidebar-group-title">Observe</span>
        ) : (
          ''
        ),
        children: observeItems,
      },
      {
        key: 'operate-group',
        type: 'group' as const,
        label: !sidebarCollapsed ? (
          <span className="sidebar-group-title">Operate</span>
        ) : (
          ''
        ),
        children: operateItems,
      },
    ],
    [observeItems, operateItems, sidebarCollapsed],
  );

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate(ROUTES.login);
  };

  const getSelectedKey = () => {
    const pathname = location.pathname;

    if (pathname.startsWith(ROUTES.latencyAlias)) {
      return ROUTES.metrics;
    }
    if (pathname.startsWith('/errors')) {
      return ROUTES.overview;
    }
    if (pathname.startsWith('/service-map')) {
      return ROUTES.services;
    }

    const matchedEntry = navEntries.find((entry) =>
      pathname === entry.path || pathname.startsWith(`${entry.path}/`),
    );

    return matchedEntry?.path || pathname;
  };

  return (
    <Sider
      className="app-sidebar"
      collapsed={sidebarCollapsed}
      onCollapse={toggleSidebar}
      collapsible
      width={220}
      collapsedWidth={56}
      theme={theme === 'light' ? 'light' : 'dark'}
    >
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Layers size={20} />
        </div>
        {!sidebarCollapsed && <span className="logo-text">Optikk</span>}
      </div>

      <div className="sidebar-menu-container">
        <div className="sidebar-nav-scroll">
          <Menu
            theme={theme === 'light' ? 'light' : 'dark'}
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={mainMenuItems}
            onClick={handleMenuClick}
            className="sidebar-menu"
          />
        </div>

        <div className="sidebar-bottom-menu">
          <div className="sidebar-quick-actions">
            <Button
              data-testid="sidebar-settings"
              type="text"
              className="sidebar-settings-btn"
              icon={<Settings size={14} />}
              onClick={() => navigate(ROUTES.settings)}
            >
              {!sidebarCollapsed && 'Settings'}
            </Button>

            <Button
              data-testid="sidebar-logout"
              type="text"
              className="sidebar-logout-btn"
              icon={<LogOut size={14} />}
              onClick={handleLogout}
            >
              {!sidebarCollapsed && 'Logout'}
            </Button>
          </div>
        </div>
      </div>
    </Sider>
  );
}
