import { Clock, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

import { useAppStore } from '@store/appStore';

import { APP_COLORS } from '@config/colorLiterals';

import { RANGE_GROUPS, DISPLAY_MAP } from './constants';
import { fmtDatetime, parseDatetime } from './utils';
import { MiniCalendar } from './MiniCalendar';
import './TimeSelector.css';

/**
 * TimeRangePicker component for selecting global time range.
 */
export default function TimeRangePicker() {
  const { timeRange, setTimeRange, setCustomTimeRange } = useAppStore();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const [fromStr, setFromStr] = useState(fmtDatetime(new Date(now.getTime() - 3600000)));
  const [toStr, setToStr] = useState(fmtDatetime(now));
  const [editingField, setEditingField] = useState<'from' | 'to'>('from');
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());

  /* Outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* Escape key */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const handleToggle = useCallback(() => {
    if (!open) {
      const n = new Date();
      setFromStr(fmtDatetime(new Date(n.getTime() - (timeRange.minutes || 60) * 60000)));
      setToStr(fmtDatetime(n));
      setCalMonth(n.getMonth());
      setCalYear(n.getFullYear());
      setEditingField('from');
    }
    setOpen((v) => !v);
  }, [open, timeRange.minutes]);

  const selectRelative = (range: { label: string; value: string; minutes: number }) => {
    setTimeRange(range);
    setOpen(false);
  };

  /* Calendar date pick — auto-advance from → to */
  const handleCalSelect = (date: Date) => {
    if (editingField === 'from') {
      const parsed = parseDatetime(fromStr);
      date.setHours(parsed ? parsed.getHours() : 0, parsed ? parsed.getMinutes() : 0, 0);
      setFromStr(fmtDatetime(date));
      // Auto-advance to "To" field
      setEditingField('to');
    } else {
      const parsed = parseDatetime(toStr);
      date.setHours(parsed ? parsed.getHours() : 23, parsed ? parsed.getMinutes() : 59, 0);
      setToStr(fmtDatetime(date));
    }
  };

  const applyAbsolute = () => {
    const start = parseDatetime(fromStr);
    const end = parseDatetime(toStr);
    if (!start || !end || start >= end) return;
    const diffMin = Math.round((end.getTime() - start.getTime()) / 60000);
    const label = `${fmtDatetime(start)} → ${fmtDatetime(end)}`;
    setCustomTimeRange({
      label,
      value: 'custom',
      minutes: diffMin,
      startTime: start.getTime(),
      endTime: end.getTime(),
    });
    setOpen(false);
  };

  const displayLabel =
    timeRange.value === 'custom'
      ? timeRange.label
      : DISPLAY_MAP[timeRange.value] || timeRange.label || 'Last 1 hour';

  return (
    <div className="trp" ref={wrapperRef}>
      <button
        className={`trp__trigger ${open ? 'trp__trigger--open' : ''}`}
        onClick={handleToggle}
        data-testid="time-range-trigger"
      >
        <Clock size={14} className="trp__trigger-icon" />
        <span className="trp__trigger-label">{displayLabel}</span>
        <ChevronDown
          size={12}
          className={`trp__trigger-chevron ${open ? 'trp__trigger-chevron--open' : ''}`}
        />
      </button>

      {open && (
        <div className="trp__dropdown" data-testid="time-range-dropdown">
          {/* Left — Quick Ranges */}
          <div className="trp__panel trp__panel--quick" style={{ padding: '6px 8px' }}>
            <span className="trp__panel-title" style={{ display: 'none' }}>
              Quick Ranges
            </span>
            {RANGE_GROUPS.map((group) => (
              <div key={group.title} className="trp__group" style={{ marginBottom: 2 }}>
                <span
                  className="trp__group-label"
                  style={{
                    display: 'block',
                    fontSize: 9,
                    fontWeight: 500,
                    color: APP_COLORS.hex_666,
                    marginBottom: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {group.title}
                </span>
                <div className="trp__pills" style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {group.items.map((item) => (
                    <button
                      key={item.value}
                      className={`trp__pill ${timeRange.value === item.value ? 'trp__pill--active' : ''}`}
                      onClick={() => selectRelative(item)}
                      style={{ padding: '2px 8px', fontSize: 11 }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="trp__divider" />

          {/* Right — Custom Range */}
          <div className="trp__panel trp__panel--custom" style={{ padding: '6px 8px' }}>
            <span className="trp__panel-title" style={{ display: 'none' }}>
              Custom Range
            </span>

            <MiniCalendar
              fromDate={parseDatetime(fromStr)}
              toDate={parseDatetime(toStr)}
              onSelectDate={handleCalSelect}
              calMonth={calMonth}
              calYear={calYear}
              setCalMonth={setCalMonth}
              setCalYear={setCalYear}
            />

            <div className="trp__inputs" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div className="trp__field" style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <label
                  className="trp__field-label"
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: APP_COLORS.hex_555,
                    textTransform: 'uppercase',
                  }}
                >
                  From
                </label>
                <input
                  className={`trp__input ${editingField === 'from' ? 'trp__input--active' : ''}`}
                  value={fromStr}
                  onChange={(e) => setFromStr(e.target.value)}
                  onFocus={() => setEditingField('from')}
                  style={{ padding: '2px 6px', fontSize: 11, width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div className="trp__field" style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <label
                  className="trp__field-label"
                  style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: APP_COLORS.hex_555,
                    textTransform: 'uppercase',
                  }}
                >
                  To
                </label>
                <input
                  className={`trp__input ${editingField === 'to' ? 'trp__input--active' : ''}`}
                  value={toStr}
                  onChange={(e) => setToStr(e.target.value)}
                  onFocus={() => setEditingField('to')}
                  style={{ padding: '2px 6px', fontSize: 11, width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <button
              className="trp__apply"
              onClick={applyAbsolute}
              style={{
                display: 'block',
                width: '100%',
                padding: '4px 0',
                marginTop: 8,
                fontSize: 11,
                fontWeight: 600,
                borderRadius: 6,
                border: 'none',
                background: APP_COLORS.hex_5e60ce,
                color: APP_COLORS.hex_fff,
                cursor: 'pointer',
              }}
            >
              Apply Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
