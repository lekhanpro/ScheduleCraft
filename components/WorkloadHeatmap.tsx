"use client";

import dynamic from "next/dynamic";
import { Activity, Flame, Gauge } from "lucide-react";

import type { DayAnalysis } from "@/lib/types";

const HeatmapChart = dynamic(() => import("@/components/charts/WorkloadHeatmapChart"), {
  ssr: false,
  loading: () => <div className="h-56 animate-pulse rounded-[28px] bg-[rgba(var(--background-soft),0.45)]" />
});

export function WorkloadHeatmap({ days }: { days: DayAnalysis[] }) {
  return (
    <section className="glass-panel rounded-[32px] p-5 md:p-6">
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="section-kicker">Load Surface</p>
          <h2 className="mt-2 text-2xl font-bold text-main">Workload heatmap</h2>
          <p className="mt-1 text-sm text-soft">Daily intensity is based on the 8-hour overload threshold, so the bars surface stress before the week collapses.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="metric-chip"><Gauge className="h-3.5 w-3.5 text-[rgb(var(--emerald))]" /> Stable</span>
          <span className="metric-chip"><Activity className="h-3.5 w-3.5 text-[rgb(var(--amber))]" /> Elevated</span>
          <span className="metric-chip"><Flame className="h-3.5 w-3.5 text-[rgb(var(--danger))]" /> Critical</span>
        </div>
      </div>
      <HeatmapChart days={days} />
    </section>
  );
}
