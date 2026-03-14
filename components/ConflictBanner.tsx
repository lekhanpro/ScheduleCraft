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
    <section className="glass-panel relative overflow-hidden rounded-[32px] border border-[rgba(var(--amber),0.2)] p-5 md:p-6">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(245,158,11,0.14),transparent_48%,rgba(239,68,68,0.08))]" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <motion.div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[rgba(var(--amber),0.14)] text-[rgb(var(--amber))]" animate={{ rotate: [0, -6, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.2 }}>
            <AlertTriangle className="h-5 w-5" />
          </motion.div>
          <div>
            <p className="section-kicker">Conflict Monitor</p>
            <h2 className="mt-1 text-2xl font-bold text-main">{conflicts.length} overlaps need attention</h2>
            <p className="mt-1 max-w-2xl text-sm text-soft">The analyzer found sessions competing for the same time window. Expand this strip to review each clash.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-start">
          <button type="button" className="button-secondary" onClick={() => setExpanded((value) => !value)}>
            {expanded ? "Hide details" : "Show details"}
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </button>
          <button type="button" className="button-primary">
            <Sparkles className="h-4 w-4" />
            Resolve Later
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="relative mt-5 overflow-hidden">
            <div className="space-y-3 border-t surface-outline pt-4">
              {conflicts.map((conflict) => (
                <div key={`${conflict.eventA.id}-${conflict.eventB.id}`} className="panel-muted rounded-[24px] px-4 py-3 text-sm text-soft">
                  <span className="font-semibold text-main">{conflict.eventA.title}</span>
                  <span> overlaps </span>
                  <span className="font-semibold text-main">{conflict.eventB.title}</span>
                  <span> by {conflict.overlapMinutes} minutes on {getDayName(conflict.eventA.day)}.</span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
