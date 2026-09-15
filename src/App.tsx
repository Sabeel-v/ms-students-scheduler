import { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ClassSelectionLoginPage } from './components/ClassSelectionLoginPage';
import { TodayTomorrowView } from './components/TodayTomorrowView';
import { MentorCalendarView } from './components/MentorCalendarView';
import {
  fetchStudentSchedule,
  getStoredClassId,
  setStoredClassId,
} from './services/scheduleApi';
import type { StudentScheduleResponse } from './types/schedule';
import { toIsoDateString } from './utils/dateUtils';
import { Calendar, AlertTriangle, ChevronDown } from 'lucide-react';

export function App() {
  const [scheduleData, setScheduleData] = useState<StudentScheduleResponse | null>(null);
  const [cachedAt, setCachedAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active class ID
  const [selectedClassId, setSelectedClassId] = useState<number | null>(() => getStoredClassId());
  
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

  // Fetch schedule once on mount
  const loadSchedule = async (forceRefresh = false) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await fetchStudentSchedule(forceRefresh);
      setScheduleData(result.data);
      setCachedAt(result.cachedAt);

      if (!selectedClassId && result.data.classes.length > 0) {
        setSelectedClassId(result.data.classes[0].id);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to load schedule data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule(false);
  }, []);

  // When user selects a class from the login page and continues
  const handleSelectAndProceed = (id: number) => {
    setSelectedClassId(id);
    setStoredClassId(id);
    setCurrentPage('schedule');
  };

  // Back to login/selection page
  const handleReturnToLogin = () => {
    setCurrentPage('login');
  };

  // Dates
  const todayStr = useMemo(() => toIsoDateString(currentTime), [currentTime]);
  const tomorrowStr = useMemo(() => {
    const tom = new Date(currentTime);
    tom.setDate(tom.getDate() + 1);
    return toIsoDateString(tom);
  }, [currentTime]);

  // ZERO-NETWORK FILTERING
  const classSchedules = useMemo(() => {
    if (!scheduleData || !selectedClassId) return [];
    return scheduleData.schedules.filter((s) => s.class?.id === selectedClassId);
  }, [scheduleData, selectedClassId]);

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
    if (!scheduleData || !selectedClassId) return null;
    return scheduleData.classes.find((c) => c.id === selectedClassId) || null;
  }, [scheduleData, selectedClassId]);

  const selectedClassName = selectedClassObj
    ? `${selectedClassObj.name} ${selectedClassObj.batch ? `(${selectedClassObj.batch})` : ''}`
    : 'Class';

  // 1. LOGIN / CLASS SELECTION SCREEN (Opening View)
  if (currentPage === 'login') {
    return (
      <div className="relative">
        <ClassSelectionLoginPage
          classes={scheduleData?.classes || []}
          selectedClassId={selectedClassId}
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
        onRefresh={() => loadSchedule(true)}
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
              onClick={() => loadSchedule(true)}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Selected Class Bar with Quick Switch */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Current Class
            </span>
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
