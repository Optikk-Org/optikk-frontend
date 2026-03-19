import { RefreshCw, ChevronDown, Columns2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

import { TimeRangePicker } from '@shared/components/ui/TimeSelector';
import { useAutoRefresh } from '@shared/hooks/useAutoRefresh';
import { Button, IconButton, Tooltip, Select } from '@shared/design-system';

import { useAppStore } from '@store/appStore';
import { useAuthStore } from '@store/authStore';

import { AUTO_REFRESH_INTERVALS } from '@config/constants';

import './Header.css';

export default function Header() {
  const { user } = useAuthStore();
  const {
    selectedTeamIds,
    setSelectedTeamIds,
    triggerRefresh,
    autoRefreshInterval,
    setAutoRefreshInterval,
    viewPreferences,
    setViewPreference,
  } = useAppStore();
  const [intervalPickerOpen, setIntervalPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const { refreshLabel, triggerRefresh: triggerHeaderRefresh } = useAutoRefresh({
    autoRefreshInterval,
    onRefresh: triggerRefresh,
  });

  const handleRefresh = () => {
    triggerHeaderRefresh();
    toast.success('Data refreshed');
  };

  const toggleDensity = () => {
    const current = viewPreferences?.density || 'comfortable';
    setViewPreference('density', current === 'comfortable' ? 'compact' : 'comfortable');
  };

  useEffect(() => {
    if (!intervalPickerOpen) return;
    const handler = (event: MouseEvent): void => {
      if (pickerRef.current && event.target instanceof Node && !pickerRef.current.contains(event.target)) {
        setIntervalPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [intervalPickerOpen]);

  const activeInterval =
    AUTO_REFRESH_INTERVALS.find((o) => o.value === autoRefreshInterval) || AUTO_REFRESH_INTERVALS[0];

  const teams = user?.teams || [];
  const teamOptions = teams.map((team) => ({
    label: team.orgName ? `${team.orgName} / ${team.name}` : team.name,
    value: team.id,
  }));

  return (
    <header className="app-header">
      <div className="header-left">
        <TimeRangePicker />
      </div>

      <div className="header-right">
        {teams.length > 0 && (
          <div className="header-team-wrap">
            <span className="header-team-label">Workspace</span>
            <Select
              multiple
              value={selectedTeamIds}
              onChange={(val) => setSelectedTeamIds(val as number[])}
              options={teamOptions}
              style={{ width: 220 }}
              placeholder="Select team"
              size="sm"
            />
          </div>
        )}

        <Tooltip content="Toggle compact mode">
          <IconButton
            icon={<Columns2 size={15} />}
            size="sm"
            variant={viewPreferences?.density === 'compact' ? 'secondary' : 'ghost'}
            label="Toggle density"
            onClick={toggleDensity}
          />
        </Tooltip>

        <div className="header-refresh-wrap" ref={pickerRef}>
          <Tooltip content="Refresh now">
            <Button
              variant="ghost"
              size="sm"
              icon={<RefreshCw size={14} />}
              onClick={handleRefresh}
              className="header-refresh-btn"
            >
              Refresh
              <span className="header-refresh-meta">{refreshLabel}</span>
            </Button>
          </Tooltip>

          <Tooltip content="Auto-refresh interval">
            <button
              className={`header-autorefresh-pill ${autoRefreshInterval ? 'header-autorefresh-pill--active' : ''}`}
              onClick={() => setIntervalPickerOpen((v) => !v)}
            >
              {activeInterval.value ? <span className="header-autorefresh-dot" /> : null}
              {activeInterval.label}
              <ChevronDown size={11} />
            </button>
          </Tooltip>

          {intervalPickerOpen && (
            <div className="header-autorefresh-dropdown">
              {AUTO_REFRESH_INTERVALS.map((opt) => (
                <button
                  key={opt.value}
                  className={`header-autorefresh-option ${opt.value === autoRefreshInterval ? 'header-autorefresh-option--active' : ''}`}
                  onClick={() => {
                    setAutoRefreshInterval(opt.value);
                    setIntervalPickerOpen(false);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
