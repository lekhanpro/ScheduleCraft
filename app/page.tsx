"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BrainCircuit, Clock3, Radar } from "lucide-react";

import { AddEventModal } from "@/components/AddEventModal";
import { ConflictBanner } from "@/components/ConflictBanner";
import { GapAnalysis } from "@/components/GapAnalysis";
import { Sidebar } from "@/components/Sidebar";
import { StudyWindowCards } from "@/components/StudyWindowCards";
import { Topbar } from "@/components/Topbar";
import { WeeklyGrid } from "@/components/WeeklyGrid";
import { WorkloadHeatmap } from "@/components/WorkloadHeatmap";
import { DAY_NAMES } from "@/lib/constants";
import type { EventDraft, ScheduleEvent } from "@/lib/types";
import { getWeekRangeLabel, getWeekStart, getTodayScheduleIndex } from "@/lib/utils";
import { useScheduleAnalysis } from "@/hooks/useScheduleAnalysis";
import { useScheduleStore } from "@/store/useScheduleStore";

type ModalState = {
  editingEvent: ScheduleEvent | null;
  initialDraft: Partial<EventDraft> | null;
  open: boolean;
};

function isImportedEventArray(value: unknown): value is ScheduleEvent[] {
  return Array.isArray(value) && value.every((event) => typeof event?.id === "string" && typeof event?.title === "string");
}

export default function HomePage() {
  const {
    activeView,
    addEvent,
    clearWeek,
    deleteEvent,
    events,
    hiddenCategories,
    hoveredEvent,
    hydrated,
    loadFromStorage,
    replaceEvents,
    selectedDay,
    setActiveView,
    setHoveredEvent,
    setSelectedDay,
    setShowConflictsOnly,
    setTheme,
    showConflictsOnly,
    theme,
    toggleCategory,
    updateEvent
  } = useScheduleStore();

  const { conflicts, conflictEventIds, dayAnalyses, gaps, studyWindows, weeklyStats } = useScheduleAnalysis(events);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [modalState, setModalState] = useState<ModalState>({
    open: false,
    editingEvent: null,
    initialDraft: null
  });

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1279px)");
    const updateMatch = () => setIsMobile(mediaQuery.matches);
    updateMatch();
    mediaQuery.addEventListener("change", updateMatch);
    return () => mediaQuery.removeEventListener("change", updateMatch);
  }, []);

  const todayIndex = getTodayScheduleIndex();
  const effectiveSelectedDay = selectedDay ?? todayIndex;
  const referenceDate = useMemo(() => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + weekOffset * 7);
    return nextDate;
  }, [weekOffset]);
  const weekStart = useMemo(() => getWeekStart(referenceDate), [referenceDate]);
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, index) => new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + index)),
    [weekStart]
  );
  const dateRangeLabel = useMemo(() => getWeekRangeLabel(referenceDate), [referenceDate]);

  const visibleEvents = useMemo(
    () =>
      events.filter(
        (event) => !hiddenCategories.includes(event.category) && (!showConflictsOnly || conflictEventIds.has(event.id))
      ),
    [conflictEventIds, events, hiddenCategories, showConflictsOnly]
  );

  const bestStudyDay = studyWindows[0] ? DAY_NAMES[studyWindows[0].day] : weeklyStats.freestDay;

  const openCreateModal = useCallback((draft?: Partial<EventDraft> | null) => {
    setModalState({ editingEvent: null, initialDraft: draft ?? null, open: true });
  }, []);

  const openEditModal = useCallback((event: ScheduleEvent) => {
    setModalState({ editingEvent: event, initialDraft: null, open: true });
  }, []);

  const handleSaveEvent = useCallback(
    (draft: Omit<ScheduleEvent, "id">, editingId?: string) => {
      if (editingId) {
        updateEvent(editingId, draft);
      } else {
        addEvent(draft);
      }
    },
    [addEvent, updateEvent]
  );

  const handleImport = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);

        if (!isImportedEventArray(parsed)) {
          throw new Error("Invalid JSON structure");
        }

        replaceEvents(parsed);
      } catch {
        window.alert("That file could not be imported. Expected a JSON array of events.");
      }
    },
    [replaceEvents]
  );

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "schedulecraft-events.json";
    link.click();
    URL.revokeObjectURL(url);
  }, [events]);

  const handleClearWeek = useCallback(() => {
    if (window.confirm("Clear every event from this week?")) {
      clearWeek();
    }
  }, [clearWeek]);

  return (
    <main className="mx-auto min-h-screen max-w-[1800px] px-4 py-4 md:px-6 lg:px-8">
      <Topbar
        activeView={activeView}
        conflictCount={conflicts.length}
        dateRangeLabel={dateRangeLabel}
        onAddEvent={() => openCreateModal({ day: effectiveSelectedDay as EventDraft["day"], startTime: 540, endTime: 600 })}
        onShiftWeek={(delta) => setWeekOffset((value) => value + delta)}
        onToggleSidebar={() => setSidebarOpen(true)}
        onViewChange={setActiveView}
      />

      <div className="mt-4 space-y-4">
        <ConflictBanner conflicts={conflicts} />

        <div className="flex items-start gap-4">
          <Sidebar
            bestStudyDay={bestStudyDay}
            events={events}
            freeGapCount={gaps.length}
            hiddenCategories={hiddenCategories}
            isMobile={isMobile}
            mobileOpen={sidebarOpen}
            onClearWeek={handleClearWeek}
            onCloseMobile={() => setSidebarOpen(false)}
            onExport={handleExport}
            onImport={handleImport}
            onShiftWeek={(delta) => setWeekOffset((value) => value + delta)}
            onToggleCategory={toggleCategory}
            onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
            showConflictsOnly={showConflictsOnly}
            stats={weeklyStats}
            theme={theme}
            toggleConflictsOnly={() => setShowConflictsOnly(!showConflictsOnly)}
          />

          <div className="min-w-0 flex-1 space-y-4">
            <section className="grid gap-4 xl:grid-cols-3">
              <div className="glass-panel rounded-[28px] p-5">
                <p className="section-kicker">AI Signal</p>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{bestStudyDay}</h2>
                    <p className="mt-1 text-sm text-slate-400">Best study day based on your current gap profile.</p>
                  </div>
                  <BrainCircuit className="h-5 w-5 text-indigo-300" />
                </div>
              </div>
              <div className="glass-panel rounded-[28px] p-5">
                <p className="section-kicker">Weekly Load</p>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{weeklyStats.avgDailyLoad.toFixed(1)}h</h2>
                    <p className="mt-1 text-sm text-slate-400">Average daily workload across the full week.</p>
                  </div>
                  <Radar className="h-5 w-5 text-emerald-300" />
                </div>
              </div>
              <div className="glass-panel rounded-[28px] p-5">
                <p className="section-kicker">Recommended Focus</p>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{weeklyStats.recommendedStudyHoursAvailable.toFixed(1)}h</h2>
                    <p className="mt-1 text-sm text-slate-400">High-quality study time still available this week.</p>
                  </div>
                  <Clock3 className="h-5 w-5 text-amber-300" />
                </div>
              </div>
            </section>

            <WeeklyGrid
              activeView={activeView}
              conflictEventIds={conflictEventIds}
              dayAnalyses={dayAnalyses}
              events={visibleEvents}
              onCreateEvent={(day, startTime, endTime) => openCreateModal({ day: day as EventDraft["day"], startTime, endTime })}
              onEditEvent={openEditModal}
              onHoverEvent={setHoveredEvent}
              onSelectDay={setSelectedDay}
              selectedDay={effectiveSelectedDay}
              todayIndex={todayIndex}
              weekDates={weekDates}
            />

            <WorkloadHeatmap days={dayAnalyses} />

            <div className="grid gap-4 2xl:grid-cols-2">
              <StudyWindowCards
                windows={studyWindows}
                onAddStudyBlock={(window) =>
                  openCreateModal({
                    category: "study",
                    day: window.day as EventDraft["day"],
                    endTime: window.endTime,
                    priority: window.score >= 85 ? "high" : "medium",
                    startTime: window.startTime,
                    title: "Focused Study Block"
                  })
                }
              />
              <GapAnalysis
                gaps={gaps}
                onScheduleStudy={(gap) =>
                  openCreateModal({
                    category: "study",
                    day: gap.day as EventDraft["day"],
                    endTime: gap.endTime,
                    priority: "medium",
                    startTime: gap.startTime,
                    title: "Study Session"
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <AddEventModal
        open={modalState.open}
        editingEvent={modalState.editingEvent}
        initialDraft={modalState.initialDraft}
        existingEvents={events}
        onDelete={deleteEvent}
        onOpenChange={(open) => setModalState((state) => ({ ...state, open }))}
        onSave={handleSaveEvent}
      />
    </main>
  );
}

