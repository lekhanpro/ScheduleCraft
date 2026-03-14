"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import type { Conflict } from "@/lib/types";
import { getDayName } from "@/lib/utils";

type ConflictBannerProps = {
  conflicts: Conflict[];
};

export function ConflictBanner({ conflicts }: ConflictBannerProps) {
  const [expanded, setExpanded] = useState(false);

  if (!conflicts.length) {
    return null;
  }

  return (
    <section className="glass-panel relative overflow-hidden rounded-[28px] border border-amber-500/30 bg-gradient-to-r from-amber-500/16 via-orange-500/12 to-rose-500/10 p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_42%)]" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <motion.div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/14 text-amber-200"
            animate={{ rotate: [0, -6, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.5 }}
          >
            <AlertTriangle className="h-5 w-5" />
          </motion.div>
          <div>
            <p className="section-kicker text-amber-200/80">Conflict Monitor</p>
            <h2 className="mt-1 text-xl font-bold text-white">{conflicts.length} conflicts detected</h2>
            <p className="mt-1 max-w-2xl text-sm text-amber-50/80">
              Overlapping sessions are already flagged in the grid. Expand this panel to inspect each clash.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-white/10"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "Hide details" : "Show details"}
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition-transform duration-150 hover:scale-[1.02]"
          >
            <Sparkles className="h-4 w-4" />
            Resolve
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative mt-4 overflow-hidden"
          >
            <div className="space-y-3 border-t border-white/10 pt-4">
              {conflicts.map((conflict) => (
                <div key={`${conflict.eventA.id}-${conflict.eventB.id}`} className="rounded-2xl border border-white/10 bg-slate-950/20 px-4 py-3 text-sm text-slate-100">
                  <span className="font-medium text-white">{conflict.eventA.title}</span>
                  <span className="text-slate-300"> overlaps </span>
                  <span className="font-medium text-white">{conflict.eventB.title}</span>
                  <span className="text-slate-300"> by {conflict.overlapMinutes} minutes on {getDayName(conflict.eventA.day)}.</span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
