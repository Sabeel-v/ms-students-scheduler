export interface ClassItem {
  id: number;
  name: string;
  batch: string | null;
  academic_year: string | null;
  display_order: number;
}

export interface ScheduleItem {
  id: number;
  schedule_date: string; // "YYYY-MM-DD"
  start_time: string;    // "HH:MM" or ""
  end_time: string | null;
  schedule_type: string; // e.g. "SESSION 1", "LAB", "MODEL EXAM"
  content: string | null;
  status: string;        // "scheduled", "completed", etc.
  notes: string | null;
  class_id?: number;
  subject_id?: number;
  faculty_id?: number;
  created_at?: string;
  updated_at?: string;
  class: {
    id: number;
    name: string;
    batch: string | null;
  };
  subject: {
    id: number;
    name: string;
  };
  faculty: {
    id: number;
    name: string;
  };
}

export interface StudentScheduleResponse {
  server_date: string; // e.g. "2026-09-14"
  classes: ClassItem[];
  schedules: ScheduleItem[];
}

export interface CachedSchedulePayload {
  data: StudentScheduleResponse;
  timestamp: number; // Unix timestamp in ms
}

export type SlotStatus = 'ongoing' | 'upcoming' | 'completed' | 'flexible';
