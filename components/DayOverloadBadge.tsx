import { Flame } from "lucide-react";

import type { DayAnalysis } from "@/lib/types";

export function DayOverloadBadge({ day }: { day: DayAnalysis }) {
  if (day.overloadScore <= 70) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(var(--amber),0.2)] bg-[rgba(var(--amber),0.1)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[rgb(var(--amber))]">
      <Flame className="h-3 w-3" />
      Overloaded
    </span>
  );
}
