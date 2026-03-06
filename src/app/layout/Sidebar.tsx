import { Button, Layout, Menu, Tooltip } from 'antd';
import {
  Layers,
  LogOut,
  Moon,
  Settings,
  Sun,
} from 'lucide-react';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

import { getDashboardIcon } from '@/components/ui/dashboard/SpecializedRendererRegistry';
import { ROUTES } from '@/shared/constants/routes';
import { usePagesConfig } from '@/hooks/usePagesConfig';

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
  const { sidebarCollapsed, toggleSidebar, theme, setTheme, selectedTeamId } =
    useAppStore();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { pages } = usePagesConfig();
  const currentTeam = (user?.teams || []).find((team) => team.id === selectedTeamId);

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

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
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
      width={240}
      collapsedWidth={64}
      theme={theme === 'light' ? 'light' : 'dark'}
    >
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Layers size={20} />
        </div>
        {!sidebarCollapsed && <span className="logo-text">Optikk</span>}
      </div>

      {!sidebarCollapsed && (
        <div className="sidebar-context-strip">
          <div className="sidebar-context-badge">Enterprise</div>
          <div className="sidebar-context-team">
            {currentTeam?.name || `Workspace #${selectedTeamId}`}
          </div>
        </div>
      )}

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

            <Tooltip
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              placement="right"
            >
              <Button
                data-testid="sidebar-theme-toggle"
                type="text"
                className="sidebar-theme-btn"
                icon={theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                onClick={toggleTheme}
              >
                {!sidebarCollapsed && (theme === 'dark' ? 'Light Theme' : 'Dark Theme')}
              </Button>
            </Tooltip>

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
