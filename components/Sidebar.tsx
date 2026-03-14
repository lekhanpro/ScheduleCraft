"use client";

import { useRef } from "react";
import { Download, Eye, EyeOff, MoonStar, RefreshCcw, SunMedium, Trash2, Upload } from "lucide-react";
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
      <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-kicker">My Schedule</p>
            <h2 className="mt-2 text-xl font-bold text-white">Command panel</h2>
          </div>
          <div className="flex gap-2">
            <button type="button" className="rounded-full border border-white/10 p-2 text-slate-300 hover:bg-white/10" onClick={() => onShiftWeek(-1)} aria-label="Previous week">
              <RefreshCcw className="h-4 w-4 rotate-180" />
            </button>
            <button type="button" className="rounded-full border border-white/10 p-2 text-slate-300 hover:bg-white/10" onClick={() => onShiftWeek(1)} aria-label="Next week">
              <RefreshCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <section className="rounded-[24px] border border-white/10 bg-white/5 p-4">
        <p className="section-kicker">Weekly Stats</p>
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          <div className="flex items-center justify-between"><span>Total scheduled</span><span className="mono-data text-white">{formatHours(stats.totalScheduledHours)}</span></div>
          <div className="flex items-center justify-between"><span>Conflicts</span><span className="mono-data text-white">{stats.totalConflicts}</span></div>
          <div className="flex items-center justify-between"><span>Free gaps</span><span className="mono-data text-white">{freeGapCount}</span></div>
          <div className="flex items-center justify-between"><span>Best study day</span><span className="text-white">{bestStudyDay}</span></div>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/5 p-4">
        <p className="section-kicker">Category Legend</p>
        <div className="mt-4 space-y-3">
          {(Object.entries(CATEGORY_META) as [EventCategory, (typeof CATEGORY_META)[EventCategory]][]).map(([key, meta]) => {
            const active = !hiddenCategories.includes(key);
            const Icon = meta.icon;
            return (
              <button
                key={key}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition-colors duration-150",
                  active ? "border-white/10 bg-white/5 text-white" : "border-white/5 bg-transparent text-slate-500"
                )}
                onClick={() => onToggleCategory(key)}
              >
                <span className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ backgroundColor: meta.softColor, color: meta.color }}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{meta.label}</span>
                    <span className="block text-xs text-slate-400">{meta.description}</span>
                  </span>
                </span>
                {active ? <Eye className="h-4 w-4 text-slate-300" /> : <EyeOff className="h-4 w-4 text-slate-500" />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/5 p-4">
        <p className="section-kicker">Filters</p>
        <button
          type="button"
          className={cn(
            "mt-4 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-medium transition-colors duration-150",
            showConflictsOnly ? "border-amber-400/20 bg-amber-400/12 text-amber-100" : "border-white/10 bg-transparent text-slate-300"
          )}
          onClick={toggleConflictsOnly}
        >
          <span>Show conflicts only</span>
          <span className="mono-data">{showConflictsOnly ? "ON" : "OFF"}</span>
        </button>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/5 p-4">
        <p className="section-kicker">Import / Export</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onImport(file);
            }
            event.currentTarget.value = "";
          }}
        />
        <div className="mt-4 grid gap-3">
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950" onClick={onExport}>
            <Download className="h-4 w-4" />
            Export JSON
          </button>
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white" onClick={() => inputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Import JSON
          </button>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/5 p-4">
        <p className="section-kicker">System</p>
        <div className="mt-4 grid gap-3">
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white" onClick={onToggleTheme}>
            {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          </button>
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-100" onClick={onClearWeek}>
            <Trash2 className="h-4 w-4" />
            Clear Week
          </button>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
        <p className="font-medium text-white">Snapshot</p>
        <p className="mt-2">{events.length} events live in this week. Best open study day: {bestStudyDay}. Free day spread leads on {stats.freestDay}.</p>
      </section>
    </div>
  );

  if (!isMobile) {
    return <aside className="glass-panel sticky top-4 hidden h-[calc(100vh-2rem)] w-[320px] shrink-0 overflow-hidden xl:block">{content}</aside>;
  }

  return (
    <AnimatePresence>
      {mobileOpen ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm xl:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          />
          <motion.aside
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 180, damping: 24 }}
            className="glass-panel fixed inset-x-0 bottom-0 z-50 max-h-[82vh] rounded-t-[28px] xl:hidden"
          >
            {content}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
