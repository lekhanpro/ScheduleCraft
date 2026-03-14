"use client";

import { useRef } from "react";
import { Download, Eye, EyeOff, Flame, MoonStar, RefreshCcw, Sparkles, SunMedium, Trash2, Upload } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { CATEGORY_META } from "@/lib/constants";
import type { EventCategory, ScheduleEvent, ThemeMode, WeeklyStats } from "@/lib/types";
import { cn, formatHours } from "@/lib/utils";

type SidebarProps = {
  bestStudyDay: string;
  events: ScheduleEvent[];
  freeGapCount: number;
  hiddenCategories: EventCategory[];
  isMobile: boolean;
  mobileOpen: boolean;
  onClearWeek: () => void;
  onCloseMobile: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onShiftWeek: (delta: number) => void;
  onToggleCategory: (category: EventCategory) => void;
  onToggleTheme: () => void;
  showConflictsOnly: boolean;
  stats: WeeklyStats;
  theme: ThemeMode;
  toggleConflictsOnly: () => void;
};

export function Sidebar({
  bestStudyDay,
  events,
  freeGapCount,
  hiddenCategories,
  isMobile,
  mobileOpen,
  onClearWeek,
  onCloseMobile,
  onExport,
  onImport,
  onShiftWeek,
  onToggleCategory,
  onToggleTheme,
  showConflictsOnly,
  stats,
  theme,
  toggleConflictsOnly
}: SidebarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const content = (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-5 scrollbar-subtle md:p-6">
      <section className="rounded-[28px] border border-border/10 bg-[linear-gradient(180deg,rgba(91,93,235,0.18),transparent_120%)] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="section-kicker text-muted/80">Schedule Pulse</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">{bestStudyDay}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Best study day based on your current gap profile and post-class recovery windows.</p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/18 text-accent">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-border/10 bg-foreground/[0.04] p-4">
            <p className="text-muted">Avg load</p>
            <p className="mt-2 text-xl font-semibold text-foreground">{formatHours(stats.avgDailyLoad)}</p>
          </div>
          <div className="rounded-2xl border border-border/10 bg-foreground/[0.04] p-4">
            <p className="text-muted">Study hours</p>
            <p className="mt-2 text-xl font-semibold text-foreground">{formatHours(stats.recommendedStudyHoursAvailable)}</p>
          </div>
        </div>
      </section>

      <section className="surface-muted p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="section-kicker">Week Controls</p>
            <h3 className="mt-2 text-lg font-semibold text-foreground">Navigation and export</h3>
          </div>
          <div className="flex gap-2">
            <button type="button" className="control-chip !px-3 !py-3" onClick={() => onShiftWeek(-1)} aria-label="Previous week"><RefreshCcw className="h-4 w-4 rotate-180" /></button>
            <button type="button" className="control-chip !px-3 !py-3" onClick={() => onShiftWeek(1)} aria-label="Next week"><RefreshCcw className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-background" onClick={onExport}><Download className="h-4 w-4" />Export JSON</button>
          <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) { onImport(file); } event.currentTarget.value = ""; }} />
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-full border border-border/10 bg-foreground/[0.04] px-4 py-3 text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-foreground/[0.08]" onClick={() => inputRef.current?.click()}><Upload className="h-4 w-4" />Import JSON</button>
        </div>
      </section>

      <section className="surface-muted p-5">
        <p className="section-kicker">Weekly Stats</p>
        <div className="mt-4 space-y-3 text-sm text-muted">
          <div className="flex items-center justify-between"><span>Total scheduled</span><span className="mono-data text-foreground">{formatHours(stats.totalScheduledHours)}</span></div>
          <div className="flex items-center justify-between"><span>Conflicts</span><span className="mono-data text-foreground">{stats.totalConflicts}</span></div>
          <div className="flex items-center justify-between"><span>Free gaps</span><span className="mono-data text-foreground">{freeGapCount}</span></div>
          <div className="flex items-center justify-between"><span>Freest day</span><span className="text-foreground">{stats.freestDay}</span></div>
        </div>
      </section>

      <section className="surface-muted p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="section-kicker">Conflict Lens</p>
            <h3 className="mt-2 text-lg font-semibold text-foreground">Filter the noise</h3>
          </div>
          <Flame className="h-5 w-5 text-amber" />
        </div>
        <button type="button" className={cn("mt-4 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-colors duration-150", showConflictsOnly ? "border-amber/20 bg-amber/10 text-amber" : "border-border/10 bg-foreground/[0.04] text-foreground")} onClick={toggleConflictsOnly}>
          <span>Show conflicts only</span>
          <span className="mono-data">{showConflictsOnly ? "ON" : "OFF"}</span>
        </button>
      </section>

      <section className="surface-muted p-5">
        <p className="section-kicker">Category Filters</p>
        <div className="mt-4 space-y-3">
          {(Object.entries(CATEGORY_META) as [EventCategory, (typeof CATEGORY_META)[EventCategory]][]).map(([key, meta]) => {
            const active = !hiddenCategories.includes(key);
            const Icon = meta.icon;
            return (
              <button key={key} type="button" className={cn("flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition-colors duration-150", active ? "border-border/10 bg-foreground/[0.04] text-foreground" : "border-border/8 bg-transparent text-muted")} onClick={() => onToggleCategory(key)}>
                <span className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl" style={{ backgroundColor: meta.softColor, color: meta.color }}><Icon className="h-4 w-4" /></span>
                  <span>
                    <span className="block text-sm font-medium">{meta.label}</span>
                    <span className="block text-xs text-muted">{meta.description}</span>
                  </span>
                </span>
                {active ? <Eye className="h-4 w-4 text-foreground" /> : <EyeOff className="h-4 w-4 text-muted" />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="surface-muted p-5">
        <p className="section-kicker">System</p>
        <div className="mt-4 grid gap-3">
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-full border border-border/10 bg-foreground/[0.04] px-4 py-3 text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-foreground/[0.08]" onClick={onToggleTheme}>
            {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          </button>
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-full border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger" onClick={onClearWeek}><Trash2 className="h-4 w-4" />Clear Week</button>
        </div>
        <div className="mt-5 rounded-2xl border border-border/10 bg-background/35 p-4 text-sm text-muted">{events.length} events loaded. Your local schedule state is still stored on this device even after auth is added.</div>
      </section>
    </div>
  );

  if (!isMobile) {
    return <aside className="glass-panel sticky top-4 hidden h-[calc(100vh-2rem)] w-[330px] shrink-0 overflow-hidden xl:block">{content}</aside>;
  }

  return (
    <AnimatePresence>
      {mobileOpen ? (
        <>
          <motion.button type="button" className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm xl:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCloseMobile} aria-label="Close sidebar" />
          <motion.aside initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 180, damping: 24 }} className="glass-panel fixed inset-x-0 bottom-0 z-50 max-h-[82vh] rounded-t-[32px] xl:hidden">{content}</motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
