import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { CATEGORY_META, DAY_LABELS, DAY_NAMES, PRIORITY_META, WORKING_DAY_END, WORKING_DAY_START } from "@/lib/constants";
import type { EventCategory, PriorityLevel } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function formatMinutes(minutes: number) {
  const safeMinutes = ((minutes % 1440) + 1440) % 1440;
  const hour = Math.floor(safeMinutes / 60);
  const minute = safeMinutes % 60;
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;

  return `${hour12}:${minute.toString().padStart(2, "0")} ${suffix}`;
}

export function formatHourLabel(minutes: number) {
  const hour = Math.floor(minutes / 60);
  return `${hour}:00`;
}

export function formatTimeRange(startTime: number, endTime: number) {
  return `${formatMinutes(startTime)} - ${formatMinutes(endTime)}`;
}

export function formatDuration(durationMinutes: number) {
  if (durationMinutes <= 0) {
    return "0 min";
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours && minutes) {
    return `${hours}h ${minutes}m`;
  }

  if (hours) {
    return `${hours}h`;
  }

  return `${minutes} min`;
}

export function formatHours(hours: number) {
  return `${hours.toFixed(hours % 1 === 0 ? 0 : 1)}h`;
}

export function buildTimeOptions(start = WORKING_DAY_START, end = WORKING_DAY_END, step = 30) {
  const options: number[] = [];

  for (let minute = start; minute <= end; minute += step) {
    options.push(minute);
  }

  return options;
}

export function getTodayScheduleIndex(date = new Date()) {
  const jsDay = date.getDay();
  return ((jsDay + 6) % 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export function getWeekStart(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const diff = getTodayScheduleIndex(start);
  start.setDate(start.getDate() - diff);
  return start;
}

export function getWeekRangeLabel(referenceDate = new Date()) {
  const start = getWeekStart(referenceDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  });

  return `${formatter.format(start)} – ${formatter.format(end)}, ${end.getFullYear()}`;
}

export function getDayName(day: number) {
  return DAY_NAMES[day] ?? "Unknown";
}

export function getDayLabel(day: number) {
  return DAY_LABELS[day] ?? "Day";
}

export function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((part) => `${part}${part}`)
          .join("")
      : normalized;

  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function getCategoryMeta(category: EventCategory) {
  return CATEGORY_META[category];
}

export function getPriorityMeta(priority: PriorityLevel) {
  return PRIORITY_META[priority];
}

export function getHeatmapColor(score: number) {
  if (score <= 30) {
    return "#10B981";
  }

  if (score <= 60) {
    return "#F59E0B";
  }

  if (score <= 80) {
    return "#F97316";
  }

  return "#EF4444";
}

export function getRelativePosition(time: number) {
  return ((time - WORKING_DAY_START) / (WORKING_DAY_END - WORKING_DAY_START)) * 100;
}

export function sortByStartTime<T extends { startTime: number; endTime: number }>(items: T[]) {
  return [...items].sort((left, right) => {
    if (left.startTime === right.startTime) {
      return left.endTime - right.endTime;
    }

    return left.startTime - right.startTime;
  });
}
