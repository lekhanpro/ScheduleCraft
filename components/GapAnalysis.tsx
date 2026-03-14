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
    <section className="glass-panel rounded-[28px] p-5 md:p-6">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-kicker text-emerald-200/70">Gap Scanner</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Free windows across the week</h2>
          <p className="mt-1 text-sm text-slate-400">Longer uninterrupted gaps are usually the best candidates for deep work or recovery.</p>
        </div>
      </div>
      <div className="scrollbar-subtle flex snap-x gap-4 overflow-x-auto pb-2">
        {topGaps.map((gap, index) => {
          const startPercent = getRelativePosition(gap.startTime);
          const endPercent = getRelativePosition(gap.endTime);

          return (
            <motion.article
              key={`${gap.day}-${gap.startTime}-${gap.endTime}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-panel-strong min-w-[260px] snap-start rounded-[24px] border border-emerald-400/20 p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/70">{getDayName(gap.day)}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{formatMinutes(gap.startTime)} – {formatMinutes(gap.endTime)}</p>
                </div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  {Math.round((gap.durationMinutes / 60) * 10) / 10} hours free
                </span>
              </div>
              <div className="relative mt-5 h-3 rounded-full bg-slate-800/80">
                <div className="absolute inset-y-0 rounded-full bg-emerald-400/20" style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }} />
              </div>
              <button
                type="button"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-400/12 px-4 py-2 text-sm font-semibold text-emerald-100 transition-colors duration-150 hover:bg-emerald-400/18"
                onClick={() => onScheduleStudy(gap)}
              >
                <CalendarRange className="h-4 w-4" />
                Schedule study session
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
