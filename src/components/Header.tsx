import React from 'react';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { formatTimeAgo } from '../utils/dateUtils';

interface HeaderProps {
  cachedAt: number | null;
  isLoading: boolean;
  onRefresh: () => void;
  currentTime: Date;
  onChangeClass?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cachedAt,
  isLoading,
  onRefresh,
  currentTime,
  onChangeClass,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white transition-colors duration-200 no-print">
      <div className="max-w-md md:max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand Left: Clean logo */}
        <div className="flex items-center">
          <img
            src="/image.png"
            alt="MS Solutions Logo"
            className="h-8 sm:h-9 w-auto max-w-[150px] object-contain transition-all"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Change Class button */}
          {onChangeClass && (
            <button
              onClick={onChangeClass}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Class</span>
            </button>
          )}

          {/* Sync badge */}
          {cachedAt && (
            <span
              title="Locally cached to minimize worker invocations"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {formatTimeAgo(cachedAt, currentTime.getTime())}
            </span>
          )}

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh schedule"
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer disabled:opacity-50"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
