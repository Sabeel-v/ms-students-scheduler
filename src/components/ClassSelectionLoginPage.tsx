import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { ClassItem, ScheduleSource } from '../types/schedule';
import { isHigherSecondaryClassName } from '../services/scheduleApi';
import { ChevronDown, Check } from 'lucide-react';

interface ClassSelectionLoginPageProps {
  classes: ClassItem[];
  selectedClassId: number | null;
  selectedSource?: ScheduleSource;
  onSelectAndContinue: (id: number, source?: ScheduleSource) => void;
  isLoading: boolean;
}

export const ClassSelectionLoginPage: React.FC<ClassSelectionLoginPageProps> = ({
  classes,
  selectedClassId,
  selectedSource,
  onSelectAndContinue,
  isLoading,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedClass = useMemo(() => {
    if (!selectedClassId) return null;
    return (
      classes.find(
        (c) => c.id === selectedClassId && (!selectedSource || !c.source || c.source === selectedSource)
      ) ||
      classes.find((c) => c.id === selectedClassId) ||
      null
    );
  }, [classes, selectedClassId, selectedSource]);

  const schoolClasses = useMemo(() => {
    return classes.filter(
      (c) => c.source === 'school' || (!c.source && !isHigherSecondaryClassName(c.name))
    );
  }, [classes]);

  const hsClasses = useMemo(() => {
    return classes.filter(
      (c) => c.source === 'higher_secondary' || (!c.source && isHigherSecondaryClassName(c.name))
    );
  }, [classes]);

  const renderClassItem = (cls: ClassItem) => {
    const isSelected =
      cls.id === selectedClassId &&
      (!selectedSource || !cls.source || cls.source === selectedSource);

    return (
      <button
        key={`${cls.source || 'default'}-${cls.id}`}
        type="button"
        onClick={() => {
          setIsDropdownOpen(false);
          const resolvedSource: ScheduleSource =
            cls.source || (isHigherSecondaryClassName(cls.name) ? 'higher_secondary' : 'school');
          onSelectAndContinue(cls.id, resolvedSource);
        }}
        className={`w-full p-2.5 rounded-lg flex items-center justify-between text-left text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
          isSelected
            ? 'bg-blue-50 text-blue-700 font-bold'
            : 'hover:bg-slate-50 text-slate-700'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              isSelected ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          />
          <span className="truncate">
            {cls.name} {cls.batch ? `(${cls.batch})` : ''}
          </span>
        </div>

        {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-1.5" />}
      </button>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 transition-colors duration-200">
      {/* Harmonious 1:1 Aspect Ratio Square Card with perfectly balanced vertical spacing */}
      <div className="w-full max-w-[320px] sm:max-w-[350px] aspect-square bg-white border border-slate-200/90 px-6 py-8 shadow-xl shadow-slate-200/50 rounded-3xl flex flex-col justify-evenly items-center relative">
        
        {/* Top block: Logo + Schedule heading with balanced typography */}
        <div className="flex flex-col items-center justify-center text-center space-y-2.5">
          <img
            src="/image.png"
            alt="MS Solutions Logo"
            className="h-10 sm:h-11 w-auto max-w-[190px] object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">
            Schedule
          </h2>
        </div>

        {/* Dropdown element: properly centered and styled with subtle border & shadow */}
        <div className="w-full relative px-1" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isLoading && classes.length === 0}
            className="w-full bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-blue-500 rounded-xl px-4 py-3 sm:py-3.5 flex items-center justify-between text-left transition-all cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <span className="text-sm font-semibold text-slate-800 truncate">
              {selectedClass
                ? `${selectedClass.name} ${selectedClass.batch ? `(${selectedClass.batch})` : ''}`
                : isLoading
                ? 'Loading classes...'
                : 'Select Class'}
            </span>

            <ChevronDown
              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180 text-blue-600' : ''
              }`}
            />
          </button>

          {/* Dropdown Popover */}
          {isDropdownOpen && (
            <div className="absolute left-1 right-1 bottom-full mb-2 z-50 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto p-1.5 space-y-2 animate-fadeIn">
              {schoolClasses.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    School
                  </div>
                  <div className="space-y-0.5">
                    {schoolClasses.map(renderClassItem)}
                  </div>
                </div>
              )}

              {hsClasses.length > 0 && (
                <div className={schoolClasses.length > 0 ? 'pt-1.5 border-t border-slate-100' : ''}>
                  <div className="px-2 py-1 text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center justify-between">
                    <span>Higher Secondary</span>
                    <span className="text-[9px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded">
                      +1 / +2
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {hsClasses.map(renderClassItem)}
                  </div>
                </div>
              )}

              {classes.length === 0 && (
                <div className="p-3 text-center text-xs text-slate-400">
                  {isLoading ? 'Loading classes...' : 'No classes available'}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
