import { Copy, Key, Users } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Surface, Skeleton, IconButton } from '@shared/design-system';

import type { SettingsTeamViewModel } from '../../types';

interface SettingsTeamTabProps {
  readonly profileLoading: boolean;
  readonly teams: SettingsTeamViewModel[];
}

function maskApiKey(key: string): string {
  if (key.length <= 8) return '••••••••';
  return `••••••••••••${key.slice(-4)}`;
}

export default function SettingsTeamTab({
  profileLoading,
  teams,
}: SettingsTeamTabProps): JSX.Element {
  const [revealedKeys, setRevealedKeys] = useState<Set<number>>(new Set());

  if (profileLoading) {
    return <div className="p-xl"><Skeleton count={4} /></div>;
  }

  const toggleReveal = (index: number) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied');
  };

  return (
    <Surface elevation={1} padding="lg" className="settings-card">
      <div className="flex items-center gap-sm mb-md">
        <Users size={20} />
        <h3 className="text-lg font-semibold m-0">Team Information</h3>
      </div>

      <div className="border-t" />

      {teams.map((team, index) => (
        <div key={`${team.name ?? 'team'}-${index}`} className="py-sm border-b">
          <div className="flex justify-between items-center mb-xs">
            <span className="font-semibold text-md">{team.name}</span>
            <span className="text-xs text-muted uppercase tracking-wide">{team.role}</span>
          </div>
          {team.apiKey && (
            <div className="flex items-center gap-xs">
              <Key size={13} className="text-muted" />
              <code className="font-mono text-xs text-secondary" style={{ wordBreak: 'break-all' }}>
                {revealedKeys.has(index) ? team.apiKey : maskApiKey(team.apiKey)}
              </code>
              <button
                className="text-xs text-muted"
                onClick={() => toggleReveal(index)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {revealedKeys.has(index) ? 'Hide' : 'Reveal'}
              </button>
              <IconButton
                icon={<Copy size={12} />}
                size="sm"
                label="Copy API key"
                onClick={() => copyKey(team.apiKey!)}
              />
            </div>
          )}
        </div>
      ))}

      {teams.length === 0 && (
        <p className="text-muted py-lg" style={{ textAlign: 'center' }}>
          You are not a member of any teams yet.
        </p>
      )}
    </Surface>
  );
}
