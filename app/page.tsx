"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { BrainCircuit, Clock3, Orbit, Radar, ShieldCheck } from "lucide-react";

import { AddEventModal } from "@/components/AddEventModal";
import { AuthPanel } from "@/components/AuthPanel";
import { ConflictBanner } from "@/components/ConflictBanner";
import { GapAnalysis } from "@/components/GapAnalysis";
import { Sidebar } from "@/components/Sidebar";
import { StudyWindowCards } from "@/components/StudyWindowCards";
import { Topbar } from "@/components/Topbar";
import { WeeklyGrid } from "@/components/WeeklyGrid";
import { WorkloadHeatmap } from "@/components/WorkloadHeatmap";
import { DAY_NAMES } from "@/lib/constants";
import { getFirebaseAuth, hasFirebaseConfig } from "@/lib/firebase";
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
  const firebaseConfigured = hasFirebaseConfig();
  const {
    activeView,
    addEvent,
    clearWeek,
    deleteEvent,
    events,
    hiddenCategories,
    initializeTheme,
    loadFromStorage,
    replaceEvents,
    resetForSignedOut,
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
  const [authReady, setAuthReady] = useState(false);
  const [previewMode, setPreviewMode] = useState(!firebaseConfigured);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [modalState, setModalState] = useState<ModalState>({ open: false, editingEvent: null, initialDraft: null });

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1279px)");
    const updateMatch = () => setIsMobile(mediaQuery.matches);
    updateMatch();
    mediaQuery.addEventListener("change", updateMatch);
    return () => mediaQuery.removeEventListener("change", updateMatch);
  }, []);

  useEffect(() => {
    if (previewMode) {
      setAuthUser(null);
      loadFromStorage("preview-local");
      setAuthReady(true);
      return;
    }

    if (!firebaseConfigured) {
      resetForSignedOut();
      setAuthReady(true);
      return;
    }

    const auth = getFirebaseAuth();

    if (!auth) {
      setAuthReady(true);
      return;
    }

    setAuthReady(false);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);

      if (user) {
        loadFromStorage(user.uid);
      } else {
        resetForSignedOut();
      }

      setAuthReady(true);
    });

    return () => unsubscribe();
  }, [firebaseConfigured, loadFromStorage, previewMode, resetForSignedOut]);

  const todayIndex = getTodayScheduleIndex();
  const effectiveSelectedDay = selectedDay ?? todayIndex;
  const referenceDate = useMemo(() => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + weekOffset * 7);
    return nextDate;
  }, [weekOffset]);
  const weekStart = useMemo(() => getWeekStart(referenceDate), [referenceDate]);
  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, index) => new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + index)), [weekStart]);
  const dateRangeLabel = useMemo(() => getWeekRangeLabel(referenceDate), [referenceDate]);

  const visibleEvents = useMemo(() => events.filter((event) => !hiddenCategories.includes(event.category) && (!showConflictsOnly || conflictEventIds.has(event.id))), [conflictEventIds, events, hiddenCategories, showConflictsOnly]);

  const bestStudyDay = studyWindows[0] ? DAY_NAMES[studyWindows[0].day] : weeklyStats.freestDay;
  const userLabel = previewMode ? "Preview Workspace" : authUser?.displayName?.trim() || authUser?.email?.split("@")[0] || "Student";
  const userMeta = previewMode ? "Local preview without Firebase credentials" : authUser?.email || "Authenticated with Firebase";

  const openCreateModal = useCallback((draft?: Partial<EventDraft> | null) => {
    setModalState({ editingEvent: null, initialDraft: draft ?? null, open: true });
  }, []);

  const openEditModal = useCallback((event: ScheduleEvent) => {
    setModalState({ editingEvent: event, initialDraft: null, open: true });
  }, []);

  const handleSaveEvent = useCallback((draft: Omit<ScheduleEvent, "id">, editingId?: string) => {
    if (editingId) {
      updateEvent(editingId, draft);
    } else {
      addEvent(draft);
    }
  }, [addEvent, updateEvent]);

  const handleImport = useCallback(async (file: File) => {
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
  }, [replaceEvents]);

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

  const handleSignOut = useCallback(async () => {
    if (previewMode) {
      setPreviewMode(false);
      resetForSignedOut();
      setAuthReady(true);
      return;
    }

    const auth = getFirebaseAuth();
    if (auth) {
      await signOut(auth);
    }
  }, [previewMode, resetForSignedOut]);

  if (!authReady) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-10 md:px-8">
        <div className="glass-panel-strong flex min-h-[320px] w-full max-w-2xl flex-col items-center justify-center rounded-[36px] p-10 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-accent/12 text-accent"><Orbit className="h-6 w-6 animate-spin" /></div>
          <h1 className="mt-6 text-3xl font-bold text-foreground">Preparing your schedule cockpit</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-muted">Checking theme preference, restoring your personal planner, and waiting for the Firebase session state.</p>
        </div>
      </main>
    );
  }

  if (!previewMode && !authUser) {
    return <AuthPanel onContinuePreview={!firebaseConfigured ? () => setPreviewMode(true) : undefined} />;
  }

  return (
    <main className="mx-auto min-h-screen max-w-[1800px] px-4 py-4 md:px-6 lg:px-8">
      <Topbar
        activeView={activeView}
        conflictCount={conflicts.length}
        dateRangeLabel={dateRangeLabel}
        isPreviewMode={previewMode}
        onAddEvent={() => openCreateModal({ day: effectiveSelectedDay as EventDraft["day"], startTime: 540, endTime: 600 })}
        onShiftWeek={(delta) => setWeekOffset((value) => value + delta)}
        onSignOut={handleSignOut}
        onToggleSidebar={() => setSidebarOpen(true)}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        onViewChange={setActiveView}
        theme={theme}
        userLabel={userLabel}
        userMeta={userMeta}
      />

      <div className="mt-5 space-y-5">
        <ConflictBanner conflicts={conflicts} />

        <div className="flex items-start gap-5">
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

          <div className="min-w-0 flex-1 space-y-5">
            <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr]">
              <div className="glass-panel relative overflow-hidden rounded-[32px] p-6 md:p-7">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(91,93,235,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_28%)]" />
                <div className="relative">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/10 bg-foreground/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                    <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                    {previewMode ? "Preview session" : "Authenticated session"}
                  </div>
                  <h2 className="mt-5 text-4xl font-bold leading-tight text-foreground md:text-5xl">{bestStudyDay} is your cleanest study lane this week.</h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
                    {previewMode ? "You are viewing the local preview workspace. Add Firebase public config values to enable the real sign-in flow." : `Signed in as ${userMeta}. Your planner data is isolated per account on this browser.`}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3 text-sm">
                    <span className="metric-chip"><BrainCircuit className="mr-2 h-4 w-4 text-accent" /> {bestStudyDay} focus day</span>
                    <span className="metric-chip"><Clock3 className="mr-2 h-4 w-4 text-amber" /> {weeklyStats.recommendedStudyHoursAvailable.toFixed(1)}h study runway</span>
                    <span className="metric-chip"><Radar className="mr-2 h-4 w-4 text-emerald" /> {events.length} scheduled blocks</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-[32px] p-6">
                <p className="section-kicker">Weekly Load</p>
                <h2 className="mt-4 text-4xl font-bold text-foreground">{weeklyStats.avgDailyLoad.toFixed(1)}h</h2>
                <p className="mt-3 text-sm leading-6 text-muted">Average daily workload across the full week, including labs, study sessions, and meetings.</p>
              </div>

              <div className="glass-panel rounded-[32px] p-6">
                <p className="section-kicker">Conflict Count</p>
                <h2 className="mt-4 text-4xl font-bold text-foreground">{conflicts.length}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">Detected overlaps currently flagged in the planner. Resolve these before locking the week.</p>
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

            <div className="grid gap-5 2xl:grid-cols-2">
              <StudyWindowCards
                windows={studyWindows}
                onAddStudyBlock={(window) => openCreateModal({ category: "study", day: window.day as EventDraft["day"], endTime: window.endTime, priority: window.score >= 85 ? "high" : "medium", startTime: window.startTime, title: "Focused Study Block" })}
              />
              <GapAnalysis
                gaps={gaps}
                onScheduleStudy={(gap) => openCreateModal({ category: "study", day: gap.day as EventDraft["day"], endTime: gap.endTime, priority: "medium", startTime: gap.startTime, title: "Study Session" })}
              />
            </div>
          </div>
        </div>
      </div>

      <AddEventModal open={modalState.open} editingEvent={modalState.editingEvent} initialDraft={modalState.initialDraft} existingEvents={events} onDelete={deleteEvent} onOpenChange={(open) => setModalState((state) => ({ ...state, open }))} onSave={handleSaveEvent} />
    </main>
  );
}
