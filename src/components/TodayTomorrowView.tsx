import React from 'react';
import type { ScheduleItem } from '../types/schedule';
import { ScheduleCard } from './ScheduleCard';
import { Calendar, PartyPopper } from 'lucide-react';

interface TodayTomorrowStackedProps {
  todayItems: ScheduleItem[];
  tomorrowItems: ScheduleItem[];
  todayDateStr: string;
  tomorrowDateStr: string;
  selectedClassName: string;
}

export const TodayTomorrowView: React.FC<TodayTomorrowStackedProps> = ({
  todayItems,
  tomorrowItems,
  todayDateStr,
  tomorrowDateStr,
  selectedClassName,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. TODAY SECTION CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
              TODAY
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {todayDateStr}
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            {todayItems.length} {todayItems.length === 1 ? 'class' : 'classes'}
          </span>
        </div>

        {/* Schedule Cards for Today */}
        {todayItems.length > 0 ? (
          <div className="space-y-3.5">
            {todayItems.map((item) => (
              <ScheduleCard
                key={item.id}
                item={item}
                classNameTitle={selectedClassName}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PartyPopper className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              No classes scheduled for today 🎉
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Enjoy your day off or prepare for upcoming sessions!
            </p>
          </div>
        )}
      </div>

      {/* 2. TOMORROW SECTION CONTAINER */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
              TOMORROW
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {tomorrowDateStr}
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            {tomorrowItems.length} {tomorrowItems.length === 1 ? 'class' : 'classes'}
          </span>
        </div>

        {/* Schedule Cards for Tomorrow */}
        {tomorrowItems.length > 0 ? (
          <div className="space-y-3.5">
            {tomorrowItems.map((item) => (
              <ScheduleCard
                key={item.id}
                item={item}
                classNameTitle={selectedClassName}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              No classes scheduled for tomorrow ✨
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              No sessions found for the next day.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
