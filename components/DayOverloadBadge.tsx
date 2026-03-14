import { Flame } from "lucide-react";

import type { DayAnalysis } from "@/lib/types";

export function DayOverloadBadge({ day }: { day: DayAnalysis }) {
  if (day.overloadScore <= 70) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-200">
      <Flame className="h-3 w-3" />
      Overloaded
    </span>
  );
}
