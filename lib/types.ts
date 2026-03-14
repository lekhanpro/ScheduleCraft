export type EventCategory =
  | "class"
  | "lab"
  | "study"
  | "meeting"
  | "break"
  | "exercise"
  | "personal";

export type PriorityLevel = "high" | "medium" | "low";
export type ActiveView = "week" | "day";
export type ThemeMode = "dark" | "light";

export interface ScheduleEvent {
  id: string;
  title: string;
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: number;
  endTime: number;
  category: EventCategory;
  color: string;
  location?: string;
  recurring: boolean;
  priority: PriorityLevel;
  notes?: string;
}

export interface Conflict {
  eventA: ScheduleEvent;
  eventB: ScheduleEvent;
  overlapMinutes: number;
}

export interface GapSlot {
  day: number;
  startTime: number;
  endTime: number;
  durationMinutes: number;
}

export interface StudyWindow {
  day: number;
  startTime: number;
  endTime: number;
  score: number;
  reason: string;
}

export interface DayAnalysis {
  day: number;
  totalHours: number;
  busyHours: number;
  freeHours: number;
  conflictCount: number;
  overloadScore: number;
  events: ScheduleEvent[];
}

export interface WeeklyStats {
  totalScheduledHours: number;
  totalConflicts: number;
  busiestDay: string;
  freestDay: string;
  avgDailyLoad: number;
  recommendedStudyHoursAvailable: number;
}

export interface EventDraft {
  title: string;
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: number;
  endTime: number;
  category: EventCategory;
  color: string;
  location?: string;
  recurring: boolean;
  priority: PriorityLevel;
  notes?: string;
}
