import React from 'react';
import type { ScheduleItem } from '../types/schedule';
import { formatTime12h } from '../utils/dateUtils';
import { Clock, User } from 'lucide-react';

interface ScheduleCardProps {
  item: ScheduleItem;
  classNameTitle?: string;
  currentTime?: Date;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ item }) => {
  const displaySubject = item.subject?.name || 'Subject';
  const displayFaculty = item.faculty?.name || 'Faculty';
  const formattedStart = formatTime12h(item.start_time);
  const formattedEnd = formatTime12h(item.end_time);

  return (
    <div className="relative rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-sm transition-all overflow-hidden printable-card">
      {/* Left blue accent vertical indicator */}
      <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-blue-600 rounded-r-full" />

      <div className="pl-3 space-y-3">
        {/* Top Header: Schedule Type Tag */}
        <div className="flex justify-end">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-900 text-white">
            {item.schedule_type || 'SESSION 1'}
          </span>
        </div>

        {/* Primary title: Subject Name */}
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            {displaySubject}
          </h3>
          {/* Subtitle: Faculty & Time */}
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {displayFaculty}
            </span>
            {formattedStart && (
              <span className="flex items-center gap-1 font-medium text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formattedStart} {formattedEnd ? `- ${formattedEnd}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Content Box */}
        {item.content && (
          <div className="bg-slate-50 rounded-xl p-3 sm:p-3.5 border border-slate-100 text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
            {item.content}
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            {item.notes}
          </div>
        )}
      </div>
    </div>
  );
};
