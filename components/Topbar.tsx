"use client";

import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  MoonStar,
  Plus,
  ShieldCheck,
  SunMedium
} from "lucide-react";

import type { ActiveView, ThemeMode } from "@/lib/types";
import { cn } from "@/lib/utils";

type TopbarProps = {
  activeView: ActiveView;
  conflictCount: number;
  dateRangeLabel: string;
  isPreviewMode: boolean;
  onAddEvent: () => void;
  onShiftWeek: (delta: number) => void;
  onSignOut: () => void;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onViewChange: (view: ActiveView) => void;
  theme: ThemeMode;
  userLabel: string;
  userMeta: string;
};

export function Topbar({
  activeView,
  conflictCount,
  dateRangeLabel,
  isPreviewMode,
  onAddEvent,
  onShiftWeek,
  onSignOut,
  onToggleSidebar,
  onToggleTheme,
  onViewChange,
  theme,
  userLabel,
  userMeta
}: TopbarProps) {
  return (
    <header className="glass-panel sticky top-4 z-40 rounded-[32px] px-4 py-4 md:px-6 md:py-5">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/10 bg-foreground/[0.04] text-foreground xl:hidden" onClick={onToggleSidebar} aria-label="Open controls">
            <Menu className="h-5 w-5" />
          </button>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/15 text-accent shadow-[0_14px_40px_rgba(79,70,229,0.22)]">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold tracking-[0.12em] text-foreground">ScheduleCraft</h1>
              <span className="hidden rounded-full border border-border/10 bg-foreground/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-muted md:inline-flex">Mission Planner</span>
            </div>
            <p className="text-sm text-muted">Visual timetable intelligence with a secure personal workspace.</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-full border border-border/10 bg-foreground/[0.04] p-1">
              {(["week", "day"] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150",
                    activeView === view ? "bg-foreground text-background" : "text-muted hover:text-foreground"
                  )}
                  onClick={() => onViewChange(view)}
                >
                  {view === "week" ? "Week" : "Day"}
                </button>
              ))}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/10 bg-foreground/[0.04] px-3 py-2 text-sm text-foreground">
              <button type="button" className="rounded-full p-1 text-muted transition-colors duration-150 hover:bg-foreground/[0.08] hover:text-foreground" onClick={() => onShiftWeek(-1)} aria-label="Previous week">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <CalendarDays className="h-4 w-4 text-accent" />
              <span>{dateRangeLabel}</span>
              <button type="button" className="rounded-full p-1 text-muted transition-colors duration-150 hover:bg-foreground/[0.08] hover:text-foreground" onClick={() => onShiftWeek(1)} aria-label="Next week">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden items-center gap-3 rounded-full border border-border/10 bg-foreground/[0.04] px-3 py-2 lg:flex">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/15 text-accent">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{userLabel}</p>
                <p className="text-xs text-muted">{userMeta}</p>
              </div>
              {isPreviewMode ? <span className="rounded-full border border-amber/20 bg-amber/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber">Preview</span> : null}
            </div>
            <button type="button" className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/10 bg-foreground/[0.04] text-foreground" aria-label="Conflict notifications">
              <Bell className="h-5 w-5" />
              {conflictCount ? <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber px-1 text-[11px] font-bold text-slate-950">{conflictCount}</span> : null}
            </button>
            <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/10 bg-foreground/[0.04] text-foreground transition-colors duration-150 hover:bg-foreground/[0.08]" onClick={onToggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
            </button>
            <button type="button" className="hidden h-11 items-center gap-2 rounded-full border border-border/10 bg-foreground/[0.04] px-4 text-sm font-semibold text-foreground transition-colors duration-150 hover:bg-foreground/[0.08] md:inline-flex" onClick={onSignOut}>
              <LogOut className="h-4 w-4" />
              {isPreviewMode ? "Exit Preview" : "Sign Out"}
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_46px_rgba(79,70,229,0.28)] transition-transform duration-150 hover:scale-[1.02]" onClick={onAddEvent}>
              <Plus className="h-4 w-4" />
              Add Event
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
