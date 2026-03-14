import { SEED_EVENTS } from "@/lib/constants";
import type { ScheduleEvent, ThemeMode } from "@/lib/types";

const LEGACY_EVENTS_STORAGE_KEY = "schedulecraft.events";
const EVENTS_STORAGE_PREFIX = "schedulecraft.events";
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

function getEventsStorageKey(userId: string) {
  return `${EVENTS_STORAGE_PREFIX}.${userId}`;
}

function parseStoredEvents(raw: string | null) {
  if (raw === null) {
    return { found: false, events: [] as ScheduleEvent[] };
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return { found: true, events: [] as ScheduleEvent[] };
    }

    return { found: true, events: parsed.filter(isScheduleEvent) };
  } catch {
    return { found: true, events: [] as ScheduleEvent[] };
  }
}

export function readStoredEvents(userId: string | null) {
  if (!isBrowser()) {
    return userId ? SEED_EVENTS : [];
  }

  if (!userId) {
    return [];
  }

  const currentUserEvents = parseStoredEvents(window.localStorage.getItem(getEventsStorageKey(userId)));

  if (currentUserEvents.found) {
    return currentUserEvents.events;
  }

  const legacyEvents = parseStoredEvents(window.localStorage.getItem(LEGACY_EVENTS_STORAGE_KEY));

  if (legacyEvents.found && legacyEvents.events.length) {
    window.localStorage.setItem(getEventsStorageKey(userId), JSON.stringify(legacyEvents.events));
    return legacyEvents.events;
  }

  return SEED_EVENTS;
}

export function storeEvents(events: ScheduleEvent[], userId: string | null) {
  if (!isBrowser() || !userId) {
    return;
  }

  window.localStorage.setItem(getEventsStorageKey(userId), JSON.stringify(events));
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
