import type { CachedSchedulePayload, StudentScheduleResponse } from '../types/schedule';

const API_ENDPOINT = 'https://faculty-scheduler.sabeelmssolution.workers.dev/api/public/student-schedule';
const CACHE_KEY = 'ms_student_schedule_data';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

export const SELECTED_CLASS_KEY = 'ms_selected_class_id';
export const THEME_KEY = 'ms_scheduler_theme';

export interface ScheduleFetchResult {
  data: StudentScheduleResponse;
  isFromCache: boolean;
  cachedAt: number;
}

export async function fetchStudentSchedule(forceRefresh = false): Promise<ScheduleFetchResult> {
  const now = Date.now();

  if (!forceRefresh) {
    try {
      const cachedRaw = localStorage.getItem(CACHE_KEY);
      if (cachedRaw) {
        const cachedPayload: CachedSchedulePayload = JSON.parse(cachedRaw);
        const age = now - cachedPayload.timestamp;
        if (age < CACHE_TTL_MS && cachedPayload.data && Array.isArray(cachedPayload.data.classes)) {
          return {
            data: cachedPayload.data,
            isFromCache: true,
            cachedAt: cachedPayload.timestamp,
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse schedule cache:', e);
    }
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const fallbackRaw = localStorage.getItem(CACHE_KEY);
    if (fallbackRaw) {
      try {
        const fallback = JSON.parse(fallbackRaw) as CachedSchedulePayload;
        return {
          data: fallback.data,
          isFromCache: true,
          cachedAt: fallback.timestamp,
        };
      } catch {
        // ignore
      }
    }
    throw new Error(`Failed to fetch schedule: ${response.status} ${response.statusText}`);
  }

  const data: StudentScheduleResponse = await response.json();
  const timestamp = Date.now();

  try {
    const payload: CachedSchedulePayload = { data, timestamp };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch (e) {
    console.warn('Failed to save schedule to localStorage:', e);
  }

  return {
    data,
    isFromCache: false,
    cachedAt: timestamp,
  };
}

export function getStoredClassId(): number | null {
  try {
    const stored = localStorage.getItem(SELECTED_CLASS_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      return isNaN(parsed) ? null : parsed;
    }
  } catch {
    return null;
  }
  return null;
}

export function setStoredClassId(id: number): void {
  try {
    localStorage.setItem(SELECTED_CLASS_KEY, id.toString());
  } catch {
    // ignore
  }
}
