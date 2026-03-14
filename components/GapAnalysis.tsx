"use client";

import { motion } from "framer-motion";
import { ArrowRight, CalendarRange } from "lucide-react";

import { getDayName, getRelativePosition, formatMinutes } from "@/lib/utils";
import type { GapSlot } from "@/lib/types";

type GapAnalysisProps = {
  gaps: GapSlot[];
  onScheduleStudy: (gap: GapSlot) => void;
};

export function GapAnalysis({ gaps, onScheduleStudy }: GapAnalysisProps) {
  const topGaps = [...gaps].sort((left, right) => right.durationMinutes - left.durationMinutes).slice(0, 8);

  return (
    <section className="glass-panel rounded-[32px] p-5 md:p-6">
      <div className="mb-4">
        <p className="section-kicker">Gap Scanner</p>
        <h2 className="mt-2 text-2xl font-bold text-main">Free windows across the week</h2>
        <p className="mt-1 text-sm text-soft">Uninterrupted space is where the planner can still recover focus hours.</p>
      </div>
      <div className="scrollbar-subtle flex snap-x gap-4 overflow-x-auto pb-2">
        {topGaps.map((gap, index) => {
          const startPercent = getRelativePosition(gap.startTime);
          const endPercent = getRelativePosition(gap.endTime);

          return (
            <motion.article key={`${gap.day}-${gap.startTime}-${gap.endTime}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="glass-panel-strong min-w-[260px] snap-start rounded-[26px] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-tone">{getDayName(gap.day)}</p>
                  <p className="mt-2 text-lg font-semibold text-main">{formatMinutes(gap.startTime)} – {formatMinutes(gap.endTime)}</p>
                </div>
                <span className="status-pill bg-[rgba(var(--emerald),0.1)] text-[rgb(var(--emerald))]">{Math.round((gap.durationMinutes / 60) * 10) / 10}h free</span>
              </div>
              <div className="relative mt-5 h-3 rounded-full bg-[rgba(var(--background-soft),0.8)]">
                <div className="absolute inset-y-0 rounded-full bg-[rgba(var(--emerald),0.24)]" style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }} />
              </div>
              <button type="button" className="button-secondary mt-5 w-full justify-between" onClick={() => onScheduleStudy(gap)}>
                <span className="inline-flex items-center gap-2"><CalendarRange className="h-4 w-4" /> Schedule study session</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
