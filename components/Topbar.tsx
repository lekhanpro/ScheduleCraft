"use client";

import { Bell, CalendarDays, ChevronLeft, ChevronRight, LayoutDashboard, Menu, Plus } from "lucide-react";

import type { ActiveView } from "@/lib/types";
import { cn } from "@/lib/utils";

type TopbarProps = {
  activeView: ActiveView;
  conflictCount: number;
  dateRangeLabel: string;
  onAddEvent: () => void;
  onShiftWeek: (delta: number) => void;
  onToggleSidebar: () => void;
  onViewChange: (view: ActiveView) => void;
};

export function Topbar({
  activeView,
  conflictCount,
  dateRangeLabel,
  onAddEvent,
  onShiftWeek,
  onToggleSidebar,
  onViewChange
}: TopbarProps) {
  return (
    <header className="glass-panel sticky top-4 z-40 rounded-[28px] px-4 py-4 md:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white xl:hidden"
            onClick={onToggleSidebar}
            aria-label="Open controls"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-500/18 text-indigo-200 shadow-glow">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-[0.12em] text-white">ScheduleCraft</h1>
            <p className="text-sm text-slate-400">Your week, analyzed.</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
            {(["week", "day"] as const).map((view) => (
              <button
                key={view}
                type="button"
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150",
                  activeView === view ? "bg-white text-slate-950" : "text-slate-300 hover:text-white"
                )}
                onClick={() => onViewChange(view)}
              >
                {view === "week" ? "Week" : "Day"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
            <button type="button" className="rounded-full p-1 hover:bg-white/10" onClick={() => onShiftWeek(-1)} aria-label="Previous week">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <CalendarDays className="h-4 w-4 text-indigo-300" />
            <span>{dateRangeLabel}</span>
            <button type="button" className="rounded-full p-1 hover:bg-white/10" onClick={() => onShiftWeek(1)} aria-label="Next week">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white"
              aria-label="Conflict notifications"
            >
              <Bell className="h-5 w-5" />
              {conflictCount ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[11px] font-bold text-slate-950">
                  {conflictCount}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition-transform duration-150 hover:scale-[1.02]"
              onClick={onAddEvent}
            >
              <Plus className="h-4 w-4" />
              Add Event
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
