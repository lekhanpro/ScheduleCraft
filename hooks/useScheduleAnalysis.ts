"use client";

import { useMemo } from "react";

import { analyzeDays, detectConflicts, findGaps, getWeeklyStats, scoreStudyWindows } from "@/lib/scheduler";
import type { ScheduleEvent } from "@/lib/types";

export function useScheduleAnalysis(events: ScheduleEvent[]) {
  return useMemo(() => {
    const conflicts = detectConflicts(events);
    const gaps = findGaps(events);
    const studyWindows = scoreStudyWindows(gaps, events);
    const dayAnalyses = analyzeDays(events);
    const weeklyStats = getWeeklyStats(events, dayAnalyses);
    const conflictEventIds = new Set(
      conflicts.flatMap((conflict) => [conflict.eventA.id, conflict.eventB.id])
    );

    return {
      conflicts,
      gaps,
      studyWindows,
      dayAnalyses,
      weeklyStats,
      conflictEventIds,
      overloadedDays: dayAnalyses.filter((day) => day.overloadScore > 70)
    };
  }, [events]);
}
