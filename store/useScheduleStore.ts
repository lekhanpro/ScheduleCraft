"use client";

import { create } from "zustand";

import { CATEGORY_META } from "@/lib/constants";
import { readStoredEvents, readStoredTheme, storeEvents, storeTheme } from "@/lib/storage";
import type { ActiveView, EventCategory, ScheduleEvent, ThemeMode } from "@/lib/types";
import { getTodayScheduleIndex } from "@/lib/utils";

type ScheduleState = {
  activeView: ActiveView;
  events: ScheduleEvent[];
  hiddenCategories: EventCategory[];
  hoveredEvent: string | null;
  hydrated: boolean;
  selectedDay: number | null;
  showConflictsOnly: boolean;
  theme: ThemeMode;
  userId: string | null;
  addEvent: (event: Omit<ScheduleEvent, "id">) => void;
  clearWeek: () => void;
  initializeTheme: () => void;
  loadFromStorage: (userId: string) => void;
  replaceEvents: (events: ScheduleEvent[]) => void;
  resetForSignedOut: () => void;
  saveToStorage: () => void;
  setActiveView: (view: ActiveView) => void;
  setHoveredEvent: (eventId: string | null) => void;
  setSelectedDay: (day: number | null) => void;
  setShowConflictsOnly: (value: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleCategory: (category: EventCategory) => void;
  updateEvent: (id: string, updates: Partial<ScheduleEvent>) => void;
  deleteEvent: (id: string) => void;
};

function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("light", theme === "light");
}

function persist(events: ScheduleEvent[], userId: string | null) {
  storeEvents(events, userId);
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  activeView: "week",
  events: [],
  hiddenCategories: [],
  hoveredEvent: null,
  hydrated: false,
  selectedDay: null,
  showConflictsOnly: false,
  theme: "dark",
  userId: null,
  addEvent: (event) => {
    const normalizedEvent = {
      ...event,
      id: crypto.randomUUID(),
      color: event.color || CATEGORY_META[event.category].color
    };

    const events = [...get().events, normalizedEvent];
    persist(events, get().userId);
    set({ events });
  },
  clearWeek: () => {
    persist([], get().userId);
    set({ events: [] });
  },
  initializeTheme: () => {
    const theme = readStoredTheme();
    applyTheme(theme);
    set({ theme });
  },
  loadFromStorage: (userId) => {
    const events = readStoredEvents(userId);
    const prefersDayView = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

    set((state) => ({
      activeView: prefersDayView ? "day" : state.activeView,
      events,
      hydrated: true,
      selectedDay: state.selectedDay ?? getTodayScheduleIndex(),
      userId
    }));
  },
  replaceEvents: (events) => {
    persist(events, get().userId);
    set({ events });
  },
  resetForSignedOut: () => {
    const prefersDayView = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

    set({
      activeView: prefersDayView ? "day" : "week",
      events: [],
      hoveredEvent: null,
      hydrated: true,
      selectedDay: getTodayScheduleIndex(),
      userId: null
    });
  },
  saveToStorage: () => {
    persist(get().events, get().userId);
    storeTheme(get().theme);
  },
  setActiveView: (activeView) => set({ activeView }),
  setHoveredEvent: (hoveredEvent) => set({ hoveredEvent }),
  setSelectedDay: (selectedDay) => set({ selectedDay }),
  setShowConflictsOnly: (showConflictsOnly) => set({ showConflictsOnly }),
  setTheme: (theme) => {
    applyTheme(theme);
    storeTheme(theme);
    set({ theme });
  },
  toggleCategory: (category) => {
    const hiddenCategories = get().hiddenCategories.includes(category)
      ? get().hiddenCategories.filter((entry) => entry !== category)
      : [...get().hiddenCategories, category];

    set({ hiddenCategories });
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

    persist(events, get().userId);
    set({ events });
  },
  deleteEvent: (id) => {
    const events = get().events.filter((event) => event.id !== id);
    persist(events, get().userId);
    set({ events, hoveredEvent: get().hoveredEvent === id ? null : get().hoveredEvent });
  }
}));
