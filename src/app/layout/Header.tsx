import { RefreshCw, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

import { TimeRangePicker } from '@shared/components/ui/TimeSelector';
import { useAutoRefresh } from '@shared/hooks/useAutoRefresh';
import { useTimeRangeURL } from '@shared/hooks/useTimeRangeURL';
import { IconButton, Tooltip, Select } from '@/components/ui';
import { resolveTimeRangeBounds, timeRangeDurationMs, isRelativeRange } from '@/types';

import { useAppStore } from '@store/appStore';
import { useAuthStore } from '@store/authStore';

import { AUTO_REFRESH_INTERVALS } from '@config/constants';

import { cn } from '@/lib/utils';

export default function Header() {
  const { user } = useAuthStore();
  const {
    selectedTeamIds,
    setSelectedTeamIds,
    triggerRefresh,
    autoRefreshInterval,
    setAutoRefreshInterval,
    timeRange,
    setCustomTimeRange,
  } = useAppStore();
  const [intervalPickerOpen, setIntervalPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const { refreshLabel, triggerRefresh: triggerHeaderRefresh } = useAutoRefresh({
    autoRefreshInterval,
    onRefresh: triggerRefresh,
  });

  // Bidirectional URL sync
  useTimeRangeURL();

  const handleRefresh = () => {
    triggerHeaderRefresh();
    toast.success('Data refreshed');
  };

  const shiftTimeRange = useCallback(
    (direction: 'back' | 'forward') => {
      const durationMs = timeRangeDurationMs(timeRange);
      const shiftMs = Math.round(durationMs / 2);
      const { startTime, endTime } = resolveTimeRangeBounds(timeRange);
      const now = Date.now();

      let newStart: number;
      let newEnd: number;
      if (direction === 'back') {
        newStart = startTime - shiftMs;
        newEnd = endTime - shiftMs;
      } else {
        newStart = startTime + shiftMs;
        newEnd = Math.min(endTime + shiftMs, now);
        // Don't let start go past now either
        if (newStart >= now) {
          newStart = now - durationMs;
          newEnd = now;
        }
      }
      setCustomTimeRange(newStart, newEnd);
    },
    [timeRange, setCustomTimeRange],
  );

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

  const isLive = autoRefreshInterval > 0 && isRelativeRange(timeRange);

  const teams = user?.teams || [];
  const teamOptions = teams.map((team) => ({
    label: team.orgName ? `${team.orgName} / ${team.name}` : team.name,
    value: team.id,
  }));

  return (
    <header className="h-[var(--space-header-h,56px)] px-6 max-md:px-3 bg-[var(--bg-card,var(--bg-secondary))] border-b border-[var(--border-color)] flex items-center justify-between relative z-[200] gap-3 overflow-visible">
      <div className="flex items-center min-w-0 flex-1 overflow-visible gap-1">
        {/* Shift back */}
        <Tooltip content="Shift time window back">
          <IconButton
            icon={<ChevronLeft size={14} />}
            size="sm"
            variant="ghost"
            label="Shift back"
            onClick={() => shiftTimeRange('back')}
          />
        </Tooltip>

        <TimeRangePicker />

        {/* Shift forward */}
        <Tooltip content="Shift time window forward">
          <IconButton
            icon={<ChevronRight size={14} />}
            size="sm"
            variant="ghost"
            label="Shift forward"
            onClick={() => shiftTimeRange('forward')}
          />
        </Tooltip>

        {/* Live indicator */}
        {isLive && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.3)] text-[10px] font-semibold text-green-400 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </span>
        )}
      </div>

      <div className="flex items-center min-w-0 ml-auto shrink">
        {teams.length > 0 && (
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-[11px] tracking-wide uppercase text-[var(--text-muted)] whitespace-nowrap max-[1240px]:hidden">
              Workspace
            </span>
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

        {/* Grafana-style combined refresh picker */}
        <div className="relative flex items-center" ref={pickerRef}>
          <Tooltip content={`Refresh now${refreshLabel ? ` · ${refreshLabel}` : ''}`}>
            <button
              className={cn(
                'inline-flex items-center justify-center h-8 w-8 rounded-l-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] cursor-pointer hover:bg-white/[0.06] hover:text-[var(--text-primary)] transition-colors',
                autoRefreshInterval && 'text-[var(--color-primary)]',
              )}
              onClick={handleRefresh}
            >
              <RefreshCw
                size={14}
                className={cn(autoRefreshInterval && 'animate-spin')}
                style={autoRefreshInterval ? { animationDuration: '2s' } : undefined}
              />
            </button>
          </Tooltip>

          <button
            className={cn(
              'inline-flex items-center gap-1 h-8 pl-2 pr-2 rounded-r-md border border-l-0 border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-muted)] text-[11px] font-medium cursor-pointer whitespace-nowrap hover:bg-white/[0.06] hover:text-[var(--text-primary)] transition-colors',
              autoRefreshInterval && 'text-[var(--color-primary)]',
            )}
            onClick={() => setIntervalPickerOpen((v) => !v)}
          >
            {activeInterval.value ? activeInterval.label : ''}
            <ChevronDown size={10} />
          </button>

          {intervalPickerOpen && (
            <div className="absolute top-[calc(100%+6px)] right-0 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-lg z-[1000] min-w-[120px] py-1 overflow-hidden">
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Auto-refresh
              </div>
              {AUTO_REFRESH_INTERVALS.map((opt) => (
                <button
                  key={opt.value}
                  className={cn(
                    'flex items-center w-full py-1.5 px-3 bg-none border-none text-[var(--text-secondary)] text-xs text-left cursor-pointer whitespace-nowrap hover:bg-white/[0.06] hover:text-[var(--text-primary)] transition-colors',
                    opt.value === autoRefreshInterval && 'text-[var(--color-primary)] font-semibold bg-[rgba(94,96,206,0.08)]',
                  )}
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
