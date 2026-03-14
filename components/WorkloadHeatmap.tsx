"use client";

import dynamic from "next/dynamic";
import { Activity, Flame, Gauge } from "lucide-react";

import type { DayAnalysis } from "@/lib/types";

const HeatmapChart = dynamic(() => import("@/components/charts/WorkloadHeatmapChart"), {
  ssr: false,
  loading: () => <div className="h-56 animate-pulse rounded-[24px] bg-white/5" />
});

export function WorkloadHeatmap({ days }: { days: DayAnalysis[] }) {
  return (
    <section className="glass-panel rounded-[28px] p-5 md:p-6">
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-kicker">Load Surface</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Workload heatmap</h2>
          <p className="mt-1 text-sm text-slate-400">Daily intensity is based on your scheduled hours relative to the 8-hour overload threshold.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-300">
          <span className="metric-chip"><Gauge className="mr-2 h-3.5 w-3.5 text-emerald-300" /> 0-30% stable</span>
          <span className="metric-chip"><Activity className="mr-2 h-3.5 w-3.5 text-amber-300" /> 31-80% elevated</span>
          <span className="metric-chip"><Flame className="mr-2 h-3.5 w-3.5 text-rose-300" /> 81-100% overloaded</span>
        </div>
      </div>
      <HeatmapChart days={days} />
    </section>
  );
}
