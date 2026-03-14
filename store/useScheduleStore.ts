"use client";

import { create } from "zustand";

import { CATEGORY_META, SEED_EVENTS } from "@/lib/constants";
import { readStoredEvents, readStoredTheme, storeEvents, storeTheme } from "@/lib/storage";
import type { ActiveView, EventCategory, ScheduleEvent, ThemeMode } from "@/lib/types";
import { getTodayScheduleIndex } from "@/lib/utils";

type ScheduleState = {
  events: ScheduleEvent[];
  selectedDay: number | null;
  hoveredEvent: string | null;
  activeView: ActiveView;
  showConflictsOnly: boolean;
  hiddenCategories: EventCategory[];
  theme: ThemeMode;
  hydrated: boolean;
  addEvent: (event: Omit<ScheduleEvent, "id">) => void;
  updateEvent: (id: string, updates: Partial<ScheduleEvent>) => void;
  deleteEvent: (id: string) => void;
  clearWeek: () => void;
  replaceEvents: (events: ScheduleEvent[]) => void;
  setSelectedDay: (day: number | null) => void;
  setHoveredEvent: (eventId: string | null) => void;
  setActiveView: (view: ActiveView) => void;
  setShowConflictsOnly: (value: boolean) => void;
  toggleCategory: (category: EventCategory) => void;
  setTheme: (theme: ThemeMode) => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
};

function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("light", theme === "light");
}

function persist(events: ScheduleEvent[]) {
  storeEvents(events);
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  events: SEED_EVENTS,
  selectedDay: null,
  hoveredEvent: null,
  activeView: "week",
  showConflictsOnly: false,
  hiddenCategories: [],
  theme: "dark",
  hydrated: false,
  addEvent: (event) => {
    const normalizedEvent = {
      ...event,
      id: crypto.randomUUID(),
      color: event.color || CATEGORY_META[event.category].color
    };

    const events = [...get().events, normalizedEvent];
    persist(events);
    set({ events });
  },
  updateEvent: (id, updates) => {
    const events = get().events.map((event) =>
      event.id === id
        ? {
            ...event,
            ...updates,
            color: updates.category ? CATEGORY_META[updates.category].color : updates.color ?? event.color
          }
        : event
    );

    persist(events);
    set({ events });
  },
  deleteEvent: (id) => {
    const events = get().events.filter((event) => event.id !== id);
    persist(events);
    set({ events, hoveredEvent: get().hoveredEvent === id ? null : get().hoveredEvent });
  },
  clearWeek: () => {
    persist([]);
    set({ events: [] });
  },
  replaceEvents: (events) => {
    persist(events);
    set({ events });
  },
  setSelectedDay: (selectedDay) => set({ selectedDay }),
  setHoveredEvent: (hoveredEvent) => set({ hoveredEvent }),
  setActiveView: (activeView) => set({ activeView }),
  setShowConflictsOnly: (showConflictsOnly) => set({ showConflictsOnly }),
  toggleCategory: (category) => {
    const hiddenCategories = get().hiddenCategories.includes(category)
      ? get().hiddenCategories.filter((entry) => entry !== category)
      : [...get().hiddenCategories, category];

    set({ hiddenCategories });
  },
  setTheme: (theme) => {
    applyTheme(theme);
    storeTheme(theme);
    set({ theme });
  },
  loadFromStorage: () => {
    const events = readStoredEvents();
    const theme = readStoredTheme();
    const prefersDayView = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

    applyTheme(theme);

    set((state) => ({
      events,
      theme,
      hydrated: true,
      activeView: prefersDayView ? "day" : state.activeView,
      selectedDay: state.selectedDay ?? getTodayScheduleIndex()
    }));
  },
  saveToStorage: () => {
    persist(get().events);
    storeTheme(get().theme);
  }
}));


