import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTHS, DAYS } from './constants';
import { dayInRange } from './utils';

interface MiniCalendarProps {
  fromDate: Date | null;
  toDate: Date | null;
  onSelectDate: (d: Date) => void;
  calMonth: number;
  calYear: number;
  setCalMonth: (m: number) => void;
  setCalYear: (y: number) => void;
}

export function MiniCalendar({
  fromDate,
  toDate,
  onSelectDate,
  calMonth,
  calYear,
  setCalMonth,
  setCalYear,
}: MiniCalendarProps) {
  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear(calYear - 1);
    } else {
      setCalMonth(calMonth - 1);
    }
  };
  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear(calYear + 1);
    } else {
      setCalMonth(calMonth + 1);
    }
  };

  const firstDay = new Date(calYear, calMonth, 1);
  const startDow = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const prevMonthDays = new Date(calYear, calMonth, 0).getDate();

  const cells: Array<{ day: number; current: boolean }> = [];
  for (let i = startDow - 1; i >= 0; i--) cells.push({ day: prevMonthDays - i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, current: false });

  const today = new Date();
  const isToday = (d: number) =>
    d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
  const isFrom = (d: number) =>
    fromDate &&
    d === fromDate.getDate() &&
    calMonth === fromDate.getMonth() &&
    calYear === fromDate.getFullYear();
  const isTo = (d: number) =>
    toDate &&
    d === toDate.getDate() &&
    calMonth === toDate.getMonth() &&
    calYear === toDate.getFullYear();
  const isInRange = (d: number) => {
    if (!fromDate || !toDate) return false;
    const cellDate = new Date(calYear, calMonth, d);
    return dayInRange(cellDate, fromDate, toDate);
  };

  return (
    <div className="trp-cal" style={{ marginBottom: 4 }}>
      <div className="trp-cal__nav" style={{ marginBottom: 2 }}>
        <button
          className="trp-cal__nav-btn"
          onClick={prevMonth}
          aria-label="Previous month"
          style={{ padding: 2 }}
        >
          <ChevronLeft size={13} />
        </button>
        <span className="trp-cal__month" style={{ fontSize: 11, fontWeight: 600 }}>
          {MONTHS[calMonth]} {calYear}
        </span>
        <button
          className="trp-cal__nav-btn"
          onClick={nextMonth}
          aria-label="Next month"
          style={{ padding: 2 }}
        >
          <ChevronRight size={13} />
        </button>
      </div>
      <div className="trp-cal__grid" style={{ gap: 0 }}>
        {DAYS.map((d) => (
          <div key={d} className="trp-cal__dow" style={{ fontSize: 9, padding: '1px 0', opacity: 0.7 }}>
            {d}
          </div>
        ))}
        {cells.map((c, i) => {
          const isRangeStart = c.current && isFrom(c.day);
          const isRangeEnd = c.current && isTo(c.day);
          const inRange = c.current && isInRange(c.day);
          return (
            <button
              key={i}
              className={[
                'trp-cal__day',
                !c.current && 'trp-cal__day--other',
                c.current && isToday(c.day) && !isRangeStart && !isRangeEnd && 'trp-cal__day--today',
                isRangeStart && 'trp-cal__day--range-start',
                isRangeEnd && 'trp-cal__day--range-end',
                inRange && 'trp-cal__day--in-range',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => {
                if (c.current) onSelectDate(new Date(calYear, calMonth, c.day));
              }}
              tabIndex={c.current ? 0 : -1}
              style={{ fontSize: 10, padding: '2px 0', lineHeight: 1.25 }}
            >
              {c.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
