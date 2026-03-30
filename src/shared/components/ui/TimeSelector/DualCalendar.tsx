import React from 'react';
import { addMonths, subMonths, format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarMonth } from './CalendarMonth';

interface DualCalendarProps {
  leftMonth: Date;
  setLeftMonth: React.Dispatch<React.SetStateAction<Date>>;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  hoverDate: Date | null;
  selectingMode: boolean;
  onSelectDate: (date: Date) => void;
  onHoverDate: (date: Date | null) => void;
}

export function DualCalendar({
  leftMonth,
  setLeftMonth,
  rangeStart,
  rangeEnd,
  hoverDate,
  selectingMode,
  onSelectDate,
  onHoverDate,
}: DualCalendarProps) {
  const rightMonth = addMonths(leftMonth, 1);
  const prevMonth = () => setLeftMonth(subMonths(leftMonth, 1));
  const nextMonth = () => setLeftMonth(addMonths(leftMonth, 1));

  return (
    <div className="flex gap-4 px-3 pt-3 pb-2">
      {/* Left month */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={prevMonth}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border-none bg-transparent cursor-pointer"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[13px] font-semibold text-[var(--text-primary)]">
            {format(leftMonth, 'MMMM yyyy')}
          </span>
          <div className="w-6" />
        </div>
        <CalendarMonth
          currentMonth={leftMonth}
          onSelectDate={onSelectDate}
          onHoverDate={onHoverDate}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          hoverDate={hoverDate}
          selectingMode={selectingMode}
        />
      </div>

      {/* Divider */}
      <div className="w-px bg-[var(--border-color)] self-stretch" />

      {/* Right month */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="w-6" />
          <span className="text-[13px] font-semibold text-[var(--text-primary)]">
            {format(rightMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={nextMonth}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border-none bg-transparent cursor-pointer"
          >
            <ChevronRight size={14} />
          </button>
        </div>
        <CalendarMonth
          currentMonth={rightMonth}
          onSelectDate={onSelectDate}
          onHoverDate={onHoverDate}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          hoverDate={hoverDate}
          selectingMode={selectingMode}
        />
      </div>
    </div>
  );
}
