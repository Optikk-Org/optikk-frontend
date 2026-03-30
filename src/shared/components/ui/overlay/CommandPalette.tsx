import {
  BarChart3,
  FileText,
  GitBranch,
  Layers,
  Network,
  Server,
  Settings,
  Activity,
  RefreshCw,
  Sun,
  Columns2,
} from 'lucide-react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { Modal } from '@/components/ui';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useAppStore } from '@store/appStore';

import type { LucideIcon } from 'lucide-react';

type CommandAction = 'refresh' | 'toggleTheme' | 'toggleDensity' | 'copyUrl';

interface CommandDef {
  id: string;
  label: string;
  icon: LucideIcon;
  group: 'Navigate' | 'Actions';
  path?: string;
  action?: CommandAction;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const COMMANDS: CommandDef[] = [
  { id: 'overview', label: 'Go to Overview', icon: Activity, path: '/overview', group: 'Navigate' },
  { id: 'metrics', label: 'Go to Metrics', icon: BarChart3, path: '/metrics', group: 'Navigate' },
  { id: 'logs', label: 'Go to Logs', icon: FileText, path: '/logs', group: 'Navigate' },
  { id: 'traces', label: 'Go to Traces', icon: GitBranch, path: '/traces', group: 'Navigate' },
  { id: 'services', label: 'Go to Services', icon: Layers, path: '/services', group: 'Navigate' },
  {
    id: 'service-map',
    label: 'Go to Service Map',
    icon: Network,
    path: '/services?tab=service-map',
    group: 'Navigate',
  },
  {
    id: 'errors',
    label: 'Go to Errors',
    icon: Activity,
    path: '/overview?tab=errors',
    group: 'Navigate',
  },
  {
    id: 'infrastructure',
    label: 'Go to Infrastructure',
    icon: Server,
    path: '/infrastructure',
    group: 'Navigate',
  },
  {
    id: 'latency',
    label: 'Go to Latency',
    icon: BarChart3,
    path: '/metrics?tab=latency',
    group: 'Navigate',
  },
  { id: 'settings', label: 'Go to Settings', icon: Settings, path: '/settings', group: 'Navigate' },
  { id: 'refresh', label: 'Refresh Data', icon: RefreshCw, action: 'refresh', group: 'Actions' },
  { id: 'toggle-theme', label: 'Toggle Theme', icon: Sun, action: 'toggleTheme', group: 'Actions' },
  {
    id: 'toggle-density',
    label: 'Toggle Compact Mode',
    icon: Columns2,
    action: 'toggleDensity',
    group: 'Actions',
  },
];

export default function CommandPalette({ open, onClose }: CommandPaletteProps): JSX.Element {
  const navigate = useNavigate();
  const { triggerRefresh, theme, setTheme, viewPreferences, setViewPreference } = useAppStore();

  const executeCommand = useCallback(
    (cmd: CommandDef): void => {
      if (cmd.path) {
        navigate(cmd.path);
      } else if (cmd.action === 'refresh') {
        triggerRefresh();
      } else if (cmd.action === 'toggleTheme') {
        setTheme(theme === 'dark' ? 'light' : 'dark');
      } else if (cmd.action === 'toggleDensity') {
        const current = viewPreferences?.density || 'comfortable';
        setViewPreference('density', current === 'comfortable' ? 'compact' : 'comfortable');
      }
      onClose();
    },
    [navigate, onClose, triggerRefresh, theme, setTheme, viewPreferences, setViewPreference]
  );

  const navCommands = COMMANDS.filter((c) => c.group === 'Navigate');
  const actionCommands = COMMANDS.filter((c) => c.group === 'Actions');

  return (
    <Modal
      open={open}
      onClose={onClose}
      closable={false}
      className="command-palette-modal overflow-hidden"
      width={560}
    >
      <div className="-mx-5 -my-4 overflow-hidden">
        <Command>
          <CommandInput placeholder="Type a command or search..." autoFocus />
          <CommandList>
            <CommandEmpty>No commands found</CommandEmpty>
            <CommandGroup heading="Navigate">
              {navCommands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <CommandItem key={cmd.id} value={cmd.label} onSelect={() => executeCommand(cmd)}>
                    <Icon size={16} />
                    <span>{cmd.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandGroup heading="Actions">
              {actionCommands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <CommandItem key={cmd.id} value={cmd.label} onSelect={() => executeCommand(cmd)}>
                    <Icon size={16} />
                    <span>{cmd.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>

        {/* Footer */}
        <div className="flex gap-4 px-4 py-2 border-t border-border text-[11px] text-muted-foreground">
          <span>
            <kbd className="text-[10px] px-1 py-px rounded border border-border bg-muted font-mono mr-[3px]">
              &uarr;
            </kbd>
            <kbd className="text-[10px] px-1 py-px rounded border border-border bg-muted font-mono mr-[3px]">
              &darr;
            </kbd>{' '}
            Navigate
          </span>
          <span>
            <kbd className="text-[10px] px-1 py-px rounded border border-border bg-muted font-mono mr-[3px]">
              &crarr;
            </kbd>{' '}
            Select
          </span>
          <span>
            <kbd className="text-[10px] px-1 py-px rounded border border-border bg-muted font-mono mr-[3px]">
              esc
            </kbd>{' '}
            Close
          </span>
        </div>
      </div>
    </Modal>
  );
}
