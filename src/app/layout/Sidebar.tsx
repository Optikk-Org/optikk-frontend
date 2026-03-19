import {
  Layers,
  LogOut,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Clock,
  Star,
} from 'lucide-react';
import { useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

import { getDomainNavigationItems } from '@/app/registry/domainRegistry';
import { getDashboardIcon } from '@shared/components/ui/dashboard/SpecializedRendererRegistry';
import { usePagesConfig } from '@/hooks/usePagesConfig';
import { ROUTES } from '@/shared/constants/routes';
import { Tooltip } from '@shared/design-system';

import { useAppStore } from '@store/appStore';
import { useAuthStore } from '@store/authStore';

import './Sidebar.css';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, theme, recentPages, viewPreferences, addRecentPage } = useAppStore();
  const favorites = viewPreferences?.favorites ?? [];
  const logout = useAuthStore((state) => state.logout);
  const { pages } = usePagesConfig();

  const staticNavEntries = useMemo(
    () =>
      getDomainNavigationItems().map((entry) => ({
        path: entry.path,
        label: entry.label,
        group: entry.group,
        iconNode: <entry.icon size={18} />,
      })),
    [],
  );

  const dynamicNavEntries = useMemo(
    () =>
      pages
        .filter((page) => page.navigable)
        .filter((page) => !staticNavEntries.some((entry) => entry.path === page.path))
        .map((page) => ({
          path: page.path,
          label: page.label,
          group: page.group,
          iconNode: getDashboardIcon(page.icon, 18),
        })),
    [pages, staticNavEntries],
  );

  const navEntries = useMemo(
    () => [...staticNavEntries, ...dynamicNavEntries],
    [dynamicNavEntries, staticNavEntries],
  );

  const observeItems = useMemo(
    () => navEntries.filter((entry) => entry.group === 'observe'),
    [navEntries],
  );

  const operateItems = useMemo(
    () => navEntries.filter((entry) => entry.group === 'operate'),
    [navEntries],
  );

  const getSelectedKey = () => {
    const pathname = location.pathname;
    if (pathname.startsWith(ROUTES.latencyAlias)) return ROUTES.metrics;
    if (pathname.startsWith('/errors')) return ROUTES.overview;
    if (pathname.startsWith('/service-map')) return ROUTES.services;
    const matchedEntry = navEntries.find(
      (entry) => pathname === entry.path || pathname.startsWith(`${entry.path}/`),
    );
    return matchedEntry?.path || pathname;
  };

  const selectedKey = getSelectedKey();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate(ROUTES.login);
  };

  // Favorite nav entries
  const favoriteEntries = useMemo(
    () => navEntries.filter((e) => favorites.includes(e.path)),
    [navEntries, favorites],
  );

  // Track page visits for recents
  useEffect(() => {
    const path = location.pathname;
    const matched = navEntries.find((e) => path === e.path || path.startsWith(`${e.path}/`));
    if (matched) {
      addRecentPage(matched.path, matched.label);
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const renderNavGroup = (label: string, items: typeof observeItems) => (
    <div className="sidebar-group" key={label}>
      {!sidebarCollapsed && <div className="sidebar-group-title">{label}</div>}
      {items.map((item) => {
        const isActive = selectedKey === item.path;
        const button = (
          <button
            key={item.path}
            className={`sidebar-nav-item ${isActive ? 'sidebar-nav-item--active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="sidebar-nav-icon">{item.iconNode}</span>
            {!sidebarCollapsed && <span className="sidebar-nav-label">{item.label}</span>}
          </button>
        );

        if (sidebarCollapsed) {
          return (
            <Tooltip key={item.path} content={item.label} placement="right">
              {button}
            </Tooltip>
          );
        }
        return button;
      })}
    </div>
  );

  return (
    <aside
      className={`app-sidebar ${sidebarCollapsed ? 'app-sidebar--collapsed' : ''}`}
      data-theme={theme === 'light' ? 'light' : undefined}
    >
      <div className="sidebar-logo" onClick={() => navigate(ROUTES.overview)}>
        <div className="logo-icon">
          <Layers size={20} />
        </div>
        {!sidebarCollapsed && <span className="logo-text">Optikk</span>}
      </div>

      <div className="sidebar-menu-container">
        <nav className="sidebar-nav-scroll" aria-label="Main navigation">
          {!sidebarCollapsed && favoriteEntries.length > 0 && (
            <div className="sidebar-group" key="favorites">
              <div className="sidebar-group-title">
                <Star size={9} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Pinned
              </div>
              {favoriteEntries.map((item) => (
                <button
                  key={`fav-${item.path}`}
                  className={`sidebar-nav-item ${selectedKey === item.path ? 'sidebar-nav-item--active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="sidebar-nav-icon">{item.iconNode}</span>
                  <span className="sidebar-nav-label">{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {renderNavGroup('Observe', observeItems)}
          {renderNavGroup('Operate', operateItems)}

          {!sidebarCollapsed && recentPages.length > 0 && (
            <div className="sidebar-group" key="recents">
              <div className="sidebar-group-title">
                <Clock size={9} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                Recent
              </div>
              {recentPages.slice(0, 5).map((recent) => (
                <button
                  key={`recent-${recent.path}`}
                  className={`sidebar-nav-item sidebar-nav-item--recent ${selectedKey === recent.path ? 'sidebar-nav-item--active' : ''}`}
                  onClick={() => navigate(recent.path)}
                >
                  <span className="sidebar-nav-label">{recent.label}</span>
                </button>
              ))}
            </div>
          )}
        </nav>

        <div className="sidebar-bottom-menu">
          <div className="sidebar-quick-actions">
            <button
              className="sidebar-action-btn sidebar-settings-btn"
              onClick={() => navigate(ROUTES.settings)}
            >
              <Settings size={14} />
              {!sidebarCollapsed && 'Settings'}
            </button>
            <button
              className="sidebar-action-btn sidebar-logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={14} />
              {!sidebarCollapsed && 'Logout'}
            </button>
          </div>

          <button
            className="sidebar-collapse-btn"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
