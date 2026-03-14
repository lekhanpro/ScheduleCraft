"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { DAY_LABELS } from "@/lib/constants";
import type { DayAnalysis } from "@/lib/types";
import { formatHours, getHeatmapColor } from "@/lib/utils";

export default function WorkloadHeatmapChart({ days }: { days: DayAnalysis[] }) {
  const data = days.map((day) => ({
    day: DAY_LABELS[day.day],
    hours: Number(day.busyHours.toFixed(1)),
    overloadScore: Math.round(day.overloadScore)
  }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 0, right: 0, top: 24, bottom: 0 }}>
          <XAxis axisLine={false} tickLine={false} dataKey="day" tick={{ fill: "rgb(var(--muted))", fontSize: 12 }} />
          <YAxis hide domain={[0, 8]} />
          <Bar dataKey="hours" radius={[18, 18, 12, 12]} animationDuration={700}>
            <LabelList dataKey="hours" position="top" formatter={(value: number) => formatHours(value)} fill="rgb(var(--foreground))" fontSize={12} />
            {data.map((entry) => (
              <Cell key={entry.day} fill={getHeatmapColor(entry.overloadScore)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
