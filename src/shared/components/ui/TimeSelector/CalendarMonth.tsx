import React from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  isSameDay,
  isToday,
} from 'date-fns';
import { cn } from '@/lib/utils';

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

interface CalendarMonthProps {
  currentMonth: Date;
  onSelectDate: (date: Date) => void;
  onHoverDate: (date: Date | null) => void;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  hoverDate: Date | null;
  selectingMode: boolean;
}

export function CalendarMonth({
  currentMonth,
  onSelectDate,
  onHoverDate,
  rangeStart,
  rangeEnd,
  hoverDate,
  selectingMode,
}: CalendarMonthProps) {
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start, end });

  let startDow = getDay(start);
  startDow = startDow === 0 ? 6 : startDow - 1;

  const padStart = Array(startDow).fill(null);
  const totalCells = padStart.concat(daysInMonth);

  const isInRange = (date: Date) => {
    if (rangeStart && rangeEnd) {
      return date > rangeStart && date < rangeEnd;
    }
    if (selectingMode && rangeStart && hoverDate) {
      const min = rangeStart < hoverDate ? rangeStart : hoverDate;
      const max = rangeStart > hoverDate ? rangeStart : hoverDate;
      return date > min && date < max;
    }
    return false;
  };

  const isStart = (date: Date) => !!rangeStart && isSameDay(date, rangeStart);
  const isEnd = (date: Date) => !!rangeEnd && isSameDay(date, rangeEnd);

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-medium text-[var(--text-tertiary)]">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {totalCells.map((day, idx) => {
          if (!day) return <div key={idx} />;

          const selectedStart = isStart(day);
          const selectedEnd = isEnd(day);
          const selected = selectedStart || selectedEnd;
          const inRange = isInRange(day);
          const today = isToday(day);

          return (
            <button
              key={idx}
              onClick={() => onSelectDate(day)}
              onMouseEnter={() => onHoverDate(day)}
              onMouseLeave={() => onHoverDate(null)}
              className={cn(
                'relative h-7 w-full text-[12px] border-none cursor-pointer flex items-center justify-center transition-colors outline-none',
                selected
                  ? 'bg-[var(--color-primary)] text-white font-semibold'
                  : inRange
                    ? 'bg-[var(--color-primary)]/15 text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]',
                selectedStart && 'rounded-l-md rounded-r-none',
                selectedEnd && 'rounded-r-md rounded-l-none',
                inRange && !selected && 'rounded-none',
                !inRange && !selected && 'rounded-md'
              )}
            >
              <span className="z-[1]">{format(day, 'd')}</span>
              {today && (
                <span
                  className={cn(
                    'absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full',
                    selected ? 'bg-white' : 'bg-[var(--color-primary)]'
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
