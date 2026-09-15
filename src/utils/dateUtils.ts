import type { SlotStatus } from '../types/schedule';

/**
 * Format "2026-09-14" into "Monday, Sep 14, 2026"
 */
export function formatFullDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format "2026-09-14" into short representation: "Mon, 14 Sep"
 */
export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Format day and date number for mobile tab pill: "Mon", "14"
 */
export function getDayAndNum(dateStr: string): { dayName: string; dayNum: string } {
  if (!dateStr) return { dayName: '', dayNum: '' };
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return {
    dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
    dayNum: date.getDate().toString(),
  };
}

/**
 * Get date string in YYYY-MM-DD from a Date object in local time
 */
export function toIsoDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Convert 24-hour "HH:MM" into "09:00 AM"
 */
export function formatTime12h(timeStr: string | null): string {
  if (!timeStr || !timeStr.trim()) return '';
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return timeStr;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return timeStr;

  const period = h >= 12 ? 'PM' : 'AM';
  const displayHours = h % 12 === 0 ? 12 : h % 12;
  const displayMinutes = String(m).padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Evaluates live slot status:
 * - 'ongoing': current time is between start_time and end_time (today only)
 * - 'upcoming': start_time is later today, or date is in future
 * - 'completed': end_time or start_time is in past
 * - 'flexible': when start_time is not provided / all-day session
 */
export function calculateSlotStatus(
  scheduleDate: string,
  startTime: string,
  endTime: string | null,
  currentNow: Date
): SlotStatus {
  const todayStr = toIsoDateString(currentNow);

  if (scheduleDate < todayStr) {
    return 'completed';
  }
  if (scheduleDate > todayStr) {
    return 'upcoming';
  }

  // Today
  if (!startTime || !startTime.trim()) {
    return 'flexible';
  }

  const [startH, startM] = startTime.split(':').map(Number);
  if (isNaN(startH)) return 'flexible';

  const nowH = currentNow.getHours();
  const nowM = currentNow.getMinutes();
  const nowMinutes = nowH * 60 + nowM;
  const startMinutes = startH * 60 + (isNaN(startM) ? 0 : startM);

  // If no end time, assume 1 hour duration
  let endMinutes = startMinutes + 60;
  if (endTime && endTime.trim()) {
    const [endH, endM] = endTime.split(':').map(Number);
    if (!isNaN(endH)) {
      endMinutes = endH * 60 + (isNaN(endM) ? 0 : endM);
    }
  }

  if (nowMinutes >= startMinutes && nowMinutes < endMinutes) {
    return 'ongoing';
  }
  if (nowMinutes < startMinutes) {
    return 'upcoming';
  }
  return 'completed';
}

/**
 * Format relative time for cache badge (e.g., "Just now", "2m ago")
 */
export function formatTimeAgo(timestampMs: number, currentNow: number): string {
  const diffSec = Math.floor((currentNow - timestampMs) / 1000);
  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  return `${diffHr}h ago`;
}
