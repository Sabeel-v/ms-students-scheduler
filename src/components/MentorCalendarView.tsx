import React from 'react';
import type { ScheduleItem } from '../types/schedule';
import { ScheduleCard } from './ScheduleCard';
import { formatShortDate } from '../utils/dateUtils';
import { Printer } from 'lucide-react';

interface MentorCalendarViewProps {
  schedules: ScheduleItem[];
  selectedClassName: string;
  currentTime: Date;
}

export const MentorCalendarView: React.FC<MentorCalendarViewProps> = ({
  schedules,
  selectedClassName,
  currentTime,
}) => {
  // Group schedules by schedule_date
  const dateGroups = React.useMemo(() => {
    const groups: { [date: string]: ScheduleItem[] } = {};
    schedules.forEach((item) => {
      const d = item.schedule_date;
      if (!groups[d]) groups[d] = [];
      groups[d].push(item);
    });

    // Sort dates ascending
    const sortedDates = Object.keys(groups).sort();
    return sortedDates.map((date) => ({
      date,
      items: groups[date].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || '')),
    }));
  }, [schedules]);

  const handlePrint = () => {
    window.print();
  };

  if (dateGroups.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
        <p className="text-slate-500">No upcoming scheduled sessions found for {selectedClassName}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action bar: export / print */}
      <div className="flex items-center justify-end no-print">
        <button
          onClick={handlePrint}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Export / Print Timetable</span>
        </button>
      </div>

      {/* Print-only Header */}
      <div className="hidden print-only mb-6 text-center border-b pb-4">
        <h1 className="text-2xl font-bold">Academic Timetable — {selectedClassName}</h1>
        <p className="text-sm text-gray-500">Printed from MS Student Portal on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Stacked Date Cards matching user's reference image */}
      <div className="space-y-6">
        {dateGroups.map((group) => (
          <div
            key={group.date}
            className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4 printable-card"
          >
            {/* Date Header matching reference image: Date title, date string, and 'X class(es)' pill badge */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                  {formatShortDate(group.date)}
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  {group.date}
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                {group.items.length} {group.items.length === 1 ? 'class' : 'classes'}
              </span>
            </div>

            {/* Schedule Cards for this date */}
            <div className="space-y-3.5">
              {group.items.map((item) => (
                <ScheduleCard
                  key={item.id}
                  item={item}
                  classNameTitle={selectedClassName}
                  currentTime={currentTime}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
