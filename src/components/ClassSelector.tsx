import React, { useState, useRef, useEffect } from 'react';
import type { ClassItem } from '../types/schedule';
import { ChevronDown, GraduationCap, Check } from 'lucide-react';

interface ClassSelectorProps {
  classes: ClassItem[];
  selectedClassId: number | null;
  onSelectClass: (id: number) => void;
  totalSchedulesCount?: number;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({
  classes,
  selectedClassId,
  onSelectClass,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || null;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full relative no-print" ref={dropdownRef}>
      {/* Dropdown trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-4 sm:p-5 flex items-center justify-between text-left shadow-sm transition-all cursor-pointer group"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Select Your Class
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {selectedClass
                ? `${selectedClass.name} ${selectedClass.batch ? `(${selectedClass.batch})` : ''}`
                : 'Click to choose class & batch...'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {classes.length} Classes Available
          </span>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' : ''
            }`}
          >
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </button>

      {/* Dropdown Menu Modal/Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
          <div className="p-2.5 max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {classes.map((item) => {
              const isSelected = item.id === selectedClassId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectClass(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-3.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isSelected ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-bold">
                        {item.name} {item.batch ? `(${item.batch})` : ''}
                      </p>
                      {item.academic_year && (
                        <p className="text-[11px] text-slate-400">Academic Year: {item.academic_year}</p>
                      )}
                    </div>
                  </div>

                  {isSelected && <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
