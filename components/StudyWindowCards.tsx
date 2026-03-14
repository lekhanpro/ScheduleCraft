"use client";

import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit } from "lucide-react";

import type { StudyWindow } from "@/lib/types";
import { getDayName, formatMinutes } from "@/lib/utils";

type StudyWindowCardsProps = {
  windows: StudyWindow[];
  onAddStudyBlock: (window: StudyWindow) => void;
};

function priorityLabel(score: number) {
  if (score >= 90) return "Best fit";
  if (score >= 75) return "Strong fit";
  return "Good fit";
}

export function StudyWindowCards({ windows, onAddStudyBlock }: StudyWindowCardsProps) {
  return (
    <section className="glass-panel rounded-[28px] p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-kicker">Study Engine</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Recommended study windows</h2>
          <p className="mt-1 text-sm text-slate-400">Top-ranked windows combine duration, energy timing, and what surrounds them in your schedule.</p>
        </div>
      </div>
      <div className="scrollbar-subtle flex snap-x gap-4 overflow-x-auto pb-2">
        {windows.map((window, index) => {
          const progressStyle = {
            background: `conic-gradient(#4F46E5 ${window.score * 3.6}deg, rgba(255,255,255,0.08) 0deg)`
          };

          return (
            <motion.article
              key={`${window.day}-${window.startTime}-${window.endTime}`}
              drag="x"
              dragConstraints={{ left: -24, right: 24 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-panel-strong min-w-[280px] snap-start rounded-[24px] border border-indigo-400/20 bg-indigo-500/8 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-indigo-200/70">{getDayName(window.day)}</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{formatMinutes(window.startTime)} – {formatMinutes(window.endTime)}</h3>
                </div>
                <div className="grid h-14 w-14 place-items-center rounded-full p-[5px]" style={progressStyle}>
                  <div className="grid h-full w-full place-items-center rounded-full bg-slate-950/90 text-sm font-semibold text-white">
                    {window.score}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-300">{window.reason}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/90">
                  <BrainCircuit className="h-3.5 w-3.5 text-indigo-300" />
                  {priorityLabel(window.score)}
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-transform duration-150 hover:scale-[1.02]"
                  onClick={() => onAddStudyBlock(window)}
                >
                  Add Study Block
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
