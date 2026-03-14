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
    <section className="glass-panel rounded-[32px] p-5 md:p-6">
      <div className="mb-5">
        <p className="section-kicker">Study Engine</p>
        <h2 className="mt-2 text-2xl font-bold text-main">Recommended study windows</h2>
        <p className="mt-1 text-sm text-soft">These windows score well on timing, duration, and what surrounds them in the week.</p>
      </div>
      <div className="scrollbar-subtle flex snap-x gap-4 overflow-x-auto pb-2">
        {windows.map((window, index) => {
          const progressStyle = { background: `conic-gradient(rgb(var(--accent)) ${window.score * 3.6}deg, rgba(var(--border),0.14) 0deg)` };
          return (
            <motion.article key={`${window.day}-${window.startTime}-${window.endTime}`} drag="x" dragConstraints={{ left: -24, right: 24 }} whileTap={{ scale: 0.98 }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} className="glass-panel-strong min-w-[280px] snap-start rounded-[26px] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-tone">{getDayName(window.day)}</p>
                  <h3 className="mt-2 text-lg font-semibold text-main">{formatMinutes(window.startTime)} – {formatMinutes(window.endTime)}</h3>
                </div>
                <div className="grid h-14 w-14 place-items-center rounded-full p-[5px]" style={progressStyle}>
                  <div className="grid h-full w-full place-items-center rounded-full bg-[rgb(var(--surface))] text-sm font-semibold text-main">{window.score}</div>
                </div>
              </div>
              <p className="mt-4 text-sm text-soft">{window.reason}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="status-pill"><BrainCircuit className="h-3.5 w-3.5 text-[rgb(var(--accent))]" /> {priorityLabel(window.score)}</span>
                <button type="button" className="button-primary" onClick={() => onAddStudyBlock(window)}>
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
