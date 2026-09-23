import type { CachedSchedulePayload, ClassItem, ScheduleSource, StudentScheduleResponse } from '../types/schedule';

export const SCHOOL_API_ENDPOINT = 'https://faculty-scheduler.sabeelmssolution.workers.dev/api/public/student-schedule';
export const HIGHER_SECONDARY_API_ENDPOINT = 'https://k12-faculty-scheduler.highersecondary-scheduler.workers.dev/api/public/student-schedule';

const CACHE_KEY_SCHOOL = 'ms_student_schedule_data_school';
const CACHE_KEY_HIGHER_SECONDARY = 'ms_student_schedule_data_higher_secondary';
const LEGACY_CACHE_KEY = 'ms_student_schedule_data';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL

export const SELECTED_CLASS_KEY = 'ms_selected_class_id';
export const SELECTED_SOURCE_KEY = 'ms_selected_schedule_source';
export const THEME_KEY = 'ms_scheduler_theme';

export interface ScheduleFetchResult {
  data: StudentScheduleResponse;
  isFromCache: boolean;
  cachedAt: number;
}

export function isHigherSecondaryClassName(name: string): boolean {
  const lower = (name || '').toLowerCase();
  return (
    lower.includes('plus one') ||
    lower.includes('plus two') ||
    lower.includes('+1') ||
    lower.includes('+2') ||
    lower.includes('higher secondary')
  );
}

export async function fetchScheduleForSource(
  source: ScheduleSource,
  forceRefresh = false
): Promise<ScheduleFetchResult> {
  const endpoint = source === 'higher_secondary' ? HIGHER_SECONDARY_API_ENDPOINT : SCHOOL_API_ENDPOINT;
  const cacheKey = source === 'higher_secondary' ? CACHE_KEY_HIGHER_SECONDARY : CACHE_KEY_SCHOOL;
  const now = Date.now();

  if (!forceRefresh) {
    try {
      const cachedRaw =
        localStorage.getItem(cacheKey) || (source === 'school' ? localStorage.getItem(LEGACY_CACHE_KEY) : null);
      if (cachedRaw) {
        const cachedPayload: CachedSchedulePayload = JSON.parse(cachedRaw);
        const age = now - cachedPayload.timestamp;
        if (age < CACHE_TTL_MS && cachedPayload.data && Array.isArray(cachedPayload.data.classes)) {
          const taggedClasses = cachedPayload.data.classes.map((c) => ({ ...c, source }));
          return {
            data: {
              ...cachedPayload.data,
              classes: taggedClasses,
            },
            isFromCache: true,
            cachedAt: cachedPayload.timestamp,
          };
        }
      }
    } catch (e) {
      console.warn(`Failed to parse schedule cache for ${source}:`, e);
    }
  }

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const fallbackRaw =
      localStorage.getItem(cacheKey) || (source === 'school' ? localStorage.getItem(LEGACY_CACHE_KEY) : null);
    if (fallbackRaw) {
      try {
        const fallback = JSON.parse(fallbackRaw) as CachedSchedulePayload;
        const taggedClasses = fallback.data.classes.map((c) => ({ ...c, source }));
        return {
          data: {
            ...fallback.data,
            classes: taggedClasses,
          },
          isFromCache: true,
          cachedAt: fallback.timestamp,
        };
      } catch {
        // ignore
      }
    }
    throw new Error(`Failed to fetch schedule: ${response.status} ${response.statusText}`);
  }

  const rawData: StudentScheduleResponse = await response.json();
  const timestamp = Date.now();
  const taggedData: StudentScheduleResponse = {
    ...rawData,
    classes: (rawData.classes || []).map((c) => ({ ...c, source })),
  };

  try {
    const payload: CachedSchedulePayload = { data: taggedData, timestamp };
    localStorage.setItem(cacheKey, JSON.stringify(payload));
  } catch (e) {
    console.warn(`Failed to save schedule to localStorage for ${source}:`, e);
  }

  return {
    data: taggedData,
    isFromCache: false,
    cachedAt: timestamp,
  };
}

export async function fetchStudentSchedule(
  forceRefresh = false,
  source: ScheduleSource = 'school'
): Promise<ScheduleFetchResult> {
  return fetchScheduleForSource(source, forceRefresh);
}

export interface InitialScheduleLoadResult {
  classes: ClassItem[];
  schoolResult?: ScheduleFetchResult;
  higherSecondaryResult?: ScheduleFetchResult;
}

export async function fetchAllClassesAndSchedules(forceRefresh = false): Promise<InitialScheduleLoadResult> {
  const [schoolSettled, hsSettled] = await Promise.allSettled([
    fetchScheduleForSource('school', forceRefresh),
    fetchScheduleForSource('higher_secondary', forceRefresh),
  ]);

  const schoolResult = schoolSettled.status === 'fulfilled' ? schoolSettled.value : undefined;
  const hsResult = hsSettled.status === 'fulfilled' ? hsSettled.value : undefined;

  const schoolClasses: ClassItem[] = schoolResult?.data.classes || [];
  const hsClasses: ClassItem[] = hsResult?.data.classes || [];

  return {
    classes: [...schoolClasses, ...hsClasses],
    schoolResult,
    higherSecondaryResult: hsResult,
  };
}

export function getStoredClassSelection(): { id: number; source: ScheduleSource } | null {
  try {
    const storedId = localStorage.getItem(SELECTED_CLASS_KEY);
    const storedSource = localStorage.getItem(SELECTED_SOURCE_KEY) as ScheduleSource | null;
    if (storedId) {
      const parsed = parseInt(storedId, 10);
      if (!isNaN(parsed)) {
        return {
          id: parsed,
          source: storedSource === 'higher_secondary' ? 'higher_secondary' : 'school',
        };
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function setStoredClassSelection(id: number, source: ScheduleSource): void {
  try {
    localStorage.setItem(SELECTED_CLASS_KEY, id.toString());
    localStorage.setItem(SELECTED_SOURCE_KEY, source);
  } catch {
    // ignore
  }
}

export function getStoredClassId(): number | null {
  const selection = getStoredClassSelection();
  return selection ? selection.id : null;
}

export function setStoredClassId(id: number): void {
  setStoredClassSelection(id, 'school');
}
