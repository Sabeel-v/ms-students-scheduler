import { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ClassSelectionLoginPage } from './components/ClassSelectionLoginPage';
import { TodayTomorrowView } from './components/TodayTomorrowView';
import { MentorCalendarView } from './components/MentorCalendarView';
import {
  fetchAllClassesAndSchedules,
  fetchScheduleForSource,
  getStoredClassSelection,
  setStoredClassSelection,
} from './services/scheduleApi';
import type { ClassItem, ScheduleSource, StudentScheduleResponse } from './types/schedule';
import { toIsoDateString } from './utils/dateUtils';
import { Calendar, AlertTriangle, ChevronDown } from 'lucide-react';

export function App() {
  const storedSelection = getStoredClassSelection();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(() => storedSelection?.id ?? null);
  const [selectedSource, setSelectedSource] = useState<ScheduleSource>(() => storedSelection?.source ?? 'school');

  const [allClasses, setAllClasses] = useState<ClassItem[]>([]);
  const [schoolData, setSchoolData] = useState<StudentScheduleResponse | null>(null);
  const [higherSecondaryData, setHigherSecondaryData] = useState<StudentScheduleResponse | null>(null);
  const [cachedAt, setCachedAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Page mode: 'login' (selection page with square card) or 'schedule' (Today and Tomorrow view)
  const [currentPage, setCurrentPage] = useState<'login' | 'schedule'>('login');

  const [isFullCalendarOpen, setIsFullCalendarOpen] = useState(false);

  // Live client-side time (updates every 30s)
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Force pure light mode on document element
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial classes and schedules on mount
  const loadInitialData = async (forceRefresh = false) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await fetchAllClassesAndSchedules(forceRefresh);
      setAllClasses(result.classes);

      if (result.schoolResult) {
        setSchoolData(result.schoolResult.data);
        if (selectedSource === 'school') {
          setCachedAt(result.schoolResult.cachedAt);
        }
      }

      if (result.higherSecondaryResult) {
        setHigherSecondaryData(result.higherSecondaryResult.data);
        if (selectedSource === 'higher_secondary') {
          setCachedAt(result.higherSecondaryResult.cachedAt);
        }
      }

      // Default to first class if nothing selected
      if (!selectedClassId && result.classes.length > 0) {
        const first = result.classes[0];
        setSelectedClassId(first.id);
        setSelectedSource(first.source || 'school');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to load schedule data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData(false);
  }, []);

  // Manual refresh of the currently active schedule source
  const handleRefresh = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await fetchScheduleForSource(selectedSource, true);
      if (selectedSource === 'higher_secondary') {
        setHigherSecondaryData(result.data);
      } else {
        setSchoolData(result.data);
      }
      setCachedAt(result.cachedAt);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to refresh schedule.');
    } finally {
      setIsLoading(false);
    }
  };

  // When user selects a class from the login page and continues
  const handleSelectAndProceed = async (id: number, source: ScheduleSource = 'school') => {
    setSelectedClassId(id);
    setSelectedSource(source);
    setStoredClassSelection(id, source);
    setCurrentPage('schedule');

    const targetData = source === 'higher_secondary' ? higherSecondaryData : schoolData;
    if (!targetData) {
      setIsLoading(true);
      try {
        const result = await fetchScheduleForSource(source, false);
        if (source === 'higher_secondary') {
          setHigherSecondaryData(result.data);
        } else {
          setSchoolData(result.data);
        }
        setCachedAt(result.cachedAt);
      } catch (err: any) {
        setErrorMessage(err?.message || 'Unable to load schedule for selected class.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Back to login/selection page
  const handleReturnToLogin = () => {
    setCurrentPage('login');
  };

  // Active schedule data based on selected source
  const activeScheduleData = useMemo(() => {
    return selectedSource === 'higher_secondary' ? higherSecondaryData : schoolData;
  }, [selectedSource, higherSecondaryData, schoolData]);

  // Dates
  const todayStr = useMemo(() => toIsoDateString(currentTime), [currentTime]);
  const tomorrowStr = useMemo(() => {
    const tom = new Date(currentTime);
    tom.setDate(tom.getDate() + 1);
    return toIsoDateString(tom);
  }, [currentTime]);

  // ZERO-NETWORK FILTERING FOR SELECTED CLASS
  const classSchedules = useMemo(() => {
    if (!activeScheduleData || !selectedClassId) return [];
    return activeScheduleData.schedules.filter((s) => s.class?.id === selectedClassId);
  }, [activeScheduleData, selectedClassId]);

  const todayItems = useMemo(() => {
    return classSchedules
      .filter((s) => s.schedule_date === todayStr)
      .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
  }, [classSchedules, todayStr]);

  const tomorrowItems = useMemo(() => {
    return classSchedules
      .filter((s) => s.schedule_date === tomorrowStr)
      .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
  }, [classSchedules, tomorrowStr]);

  const upcomingMentorSchedules = useMemo(() => {
    return classSchedules
      .filter((s) => s.schedule_date >= todayStr)
      .sort((a, b) => {
        if (a.schedule_date !== b.schedule_date) {
          return a.schedule_date.localeCompare(b.schedule_date);
        }
        return (a.start_time || '').localeCompare(b.start_time || '');
      });
  }, [classSchedules, todayStr]);

  const selectedClassObj = useMemo(() => {
    if (!selectedClassId) return null;
    return (
      allClasses.find((c) => c.id === selectedClassId && c.source === selectedSource) ||
      allClasses.find((c) => c.id === selectedClassId) ||
      null
    );
  }, [allClasses, selectedClassId, selectedSource]);

  const selectedClassName = selectedClassObj
    ? `${selectedClassObj.name} ${selectedClassObj.batch ? `(${selectedClassObj.batch})` : ''}`
    : 'Class';

  // 1. LOGIN / CLASS SELECTION SCREEN (Opening View)
  if (currentPage === 'login') {
    return (
      <div className="relative">
        <ClassSelectionLoginPage
          classes={allClasses}
          selectedClassId={selectedClassId}
          selectedSource={selectedSource}
          onSelectAndContinue={handleSelectAndProceed}
          isLoading={isLoading}
        />
      </div>
    );
  }

  // 2. SCHEDULE PAGE (TODAY AND TOMORROW VIEW)
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 transition-colors duration-200">
      {/* Header */}
      <Header
        cachedAt={cachedAt}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        currentTime={currentTime}
        onChangeClass={handleReturnToLogin}
      />

      {/* Main Schedule Container */}
      <main className="max-w-md md:max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={handleRefresh}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Selected Class Bar with Quick Switch */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 flex items-center justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Current Class
              </span>
              {selectedSource === 'higher_secondary' && (
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  Higher Secondary
                </span>
              )}
            </div>
            <span className="text-base font-extrabold text-slate-900">
              {selectedClassName}
            </span>
          </div>

          <button
            onClick={handleReturnToLogin}
            className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Change</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Today and Tomorrow Schedule Stacked */}
        <TodayTomorrowView
          todayItems={todayItems}
          tomorrowItems={tomorrowItems}
          todayDateStr={todayStr}
          tomorrowDateStr={tomorrowStr}
          selectedClassName={selectedClassName}
        />

        {/* Calendar Expand Button */}
        <div className="pt-2 flex justify-center no-print">
          <button
            onClick={() => setIsFullCalendarOpen(!isFullCalendarOpen)}
            className={`py-2.5 px-6 rounded-2xl border font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 shadow-sm active:scale-[0.99] cursor-pointer ${
              isFullCalendarOpen
                ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/25 shadow-md'
                : 'bg-white text-slate-800 border-slate-200 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>
              {isFullCalendarOpen
                ? 'Hide Calendar'
                : 'Calendar'}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                isFullCalendarOpen
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {upcomingMentorSchedules.length} Upcoming
            </span>
          </button>
        </div>

        {/* Mentor Full Matrix View */}
        {isFullCalendarOpen && (
          <section className="animate-fadeIn">
            <MentorCalendarView
              schedules={upcomingMentorSchedules}
              selectedClassName={selectedClassName}
              currentTime={currentTime}
            />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
