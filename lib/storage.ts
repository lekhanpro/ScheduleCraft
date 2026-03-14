import { SEED_EVENTS } from "@/lib/constants";
import type { ScheduleEvent, ThemeMode } from "@/lib/types";

export const EVENTS_STORAGE_KEY = "schedulecraft.events";
export const THEME_STORAGE_KEY = "schedulecraft.theme";

const isBrowser = () => typeof window !== "undefined";

function isScheduleEvent(value: unknown): value is ScheduleEvent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const event = value as Record<string, unknown>;

  return (
    typeof event.id === "string" &&
    typeof event.title === "string" &&
    typeof event.day === "number" &&
    typeof event.startTime === "number" &&
    typeof event.endTime === "number" &&
    typeof event.category === "string" &&
    typeof event.color === "string" &&
    typeof event.recurring === "boolean" &&
    typeof event.priority === "string"
  );
}

export function readStoredEvents() {
  if (!isBrowser()) {
    return SEED_EVENTS;
  }

  try {
    const raw = window.localStorage.getItem(EVENTS_STORAGE_KEY);

    if (!raw) {
      return SEED_EVENTS;
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return SEED_EVENTS;
    }

    const sanitized = parsed.filter(isScheduleEvent);
    return sanitized.length ? sanitized : SEED_EVENTS;
  } catch {
    return SEED_EVENTS;
  }
}

export function storeEvents(events: ScheduleEvent[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
}

export function readStoredTheme(): ThemeMode {
  if (!isBrowser()) {
    return "dark";
  }

  const value = window.localStorage.getItem(THEME_STORAGE_KEY);
  return value === "light" ? "light" : "dark";
}

export function storeTheme(theme: ThemeMode) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}
