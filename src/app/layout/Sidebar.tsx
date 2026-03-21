import {
  Layers,
  LogOut,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';

import { getDomainNavigationItems } from '@/app/registry/domainRegistry';
import { getDashboardIcon } from '@shared/components/ui/dashboard/SpecializedRendererRegistry';
import { usePagesConfig } from '@/hooks/usePagesConfig';
import { ROUTES } from '@/shared/constants/routes';
import { Tooltip } from '@/components/ui';

import { useAppStore } from '@store/appStore';
import { useAuthStore } from '@store/authStore';

import { cn } from '@/lib/utils';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, theme } = useAppStore();
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

  const navItemClass = (isActive: boolean, extra?: string) =>
    cn(
      'flex items-center gap-[var(--space-sm)] w-full py-[7px] px-[var(--space-sm)] my-0.5 border border-transparent rounded-lg bg-transparent text-[var(--text-secondary)] text-[13px] font-medium cursor-pointer transition-colors text-left whitespace-nowrap',
      'hover:bg-white/5 hover:text-[var(--text-primary)]',
      isActive && 'bg-[rgba(94,96,206,0.16)] text-[var(--color-primary)] border-[rgba(94,96,206,0.25)] hover:bg-[rgba(94,96,206,0.20)]',
      sidebarCollapsed && 'justify-center px-[7px]',
      extra,
    );

  const renderNavGroup = (label: string, items: typeof observeItems) => (
    <div className="mb-[var(--space-xs)]" key={label}>
      {!sidebarCollapsed && (
        <div className="text-[9px] text-[var(--text-caption,var(--text-muted))] uppercase tracking-[0.7px] font-semibold px-[var(--space-xs)] pb-[var(--space-2xs)] pt-[var(--space-xs)] leading-[22px]">
          {label}
        </div>
      )}
      {items.map((item) => {
        const isActive = selectedKey === item.path;
        const button = (
          <button
            key={item.path}
            className={navItemClass(isActive)}
            onClick={() => navigate(item.path)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="inline-flex items-center shrink-0">{item.iconNode}</span>
            {!sidebarCollapsed && <span className="overflow-hidden text-ellipsis">{item.label}</span>}
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
      className={cn(
        'fixed left-0 top-0 bottom-0 w-[var(--space-sidebar-w,220px)] h-screen bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border-r border-[var(--glass-border)] z-[100] flex flex-col transition-[width] duration-200',
        sidebarCollapsed && 'w-[var(--space-sidebar-collapsed,56px)]',
      )}
      data-theme={theme === 'light' ? 'light' : undefined}
    >
      <div
        className={cn(
          'h-[var(--space-header-h,56px)] flex items-center justify-center gap-3 px-[var(--space-lg)] border-b border-[var(--glass-border)] cursor-pointer shrink-0',
          sidebarCollapsed && 'px-0',
        )}
        onClick={() => navigate(ROUTES.overview)}
      >
        <div className="w-8 h-8 bg-[var(--gradient-primary)] rounded-lg flex items-center justify-center text-white shrink-0 shadow-[0_6px_14px_rgba(94,96,206,0.35)]">
          <Layers size={20} />
        </div>
        {!sidebarCollapsed && (
          <span className="text-lg font-bold bg-[var(--gradient-text-accent)] bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent] whitespace-nowrap">
            Optikk
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-[var(--space-xs)]" aria-label="Main navigation">
          {renderNavGroup('Observe', observeItems)}
          {renderNavGroup('Operate', operateItems)}
        </nav>

        <div className="border-t border-[var(--glass-border)] shrink-0">
          <div className="p-[var(--space-xs)]">
            <button
              className={cn(
                'flex items-center gap-[var(--space-xs)] w-full py-1.5 px-[var(--space-sm)] rounded-lg font-medium text-xs cursor-pointer transition-colors text-left',
                'text-[var(--text-primary)] border border-[rgba(94,96,206,0.35)] bg-[rgba(94,96,206,0.14)] mb-[var(--space-xs)] hover:border-[var(--color-primary)] hover:bg-[rgba(94,96,206,0.22)]',
                sidebarCollapsed && 'justify-center px-1.5',
              )}
              onClick={() => navigate(ROUTES.settings)}
            >
              <Settings size={14} />
              {!sidebarCollapsed && 'Settings'}
            </button>
            <button
              className={cn(
                'flex items-center gap-[var(--space-xs)] w-full py-1.5 px-[var(--space-sm)] rounded-lg font-medium text-xs cursor-pointer transition-colors text-left',
                'text-[var(--text-secondary)] border border-[var(--border-light)] bg-transparent hover:text-[var(--text-primary)] hover:border-[var(--border-color)] hover:bg-[var(--bg-hover)]',
                sidebarCollapsed && 'justify-center px-1.5',
              )}
              onClick={handleLogout}
            >
              <LogOut size={14} />
              {!sidebarCollapsed && 'Logout'}
            </button>
          </div>

          <button
            className="flex items-center justify-center w-full h-10 border-none border-t border-[var(--glass-border)] bg-transparent text-[var(--text-muted)] cursor-pointer transition-colors hover:text-[var(--text-primary)] hover:bg-white/[0.04]"
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
