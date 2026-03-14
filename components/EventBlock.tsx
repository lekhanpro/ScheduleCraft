"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { motion, useReducedMotion } from "framer-motion";

import { CATEGORY_META, PRIORITY_META } from "@/lib/constants";
import type { ScheduleEvent } from "@/lib/types";
import { cn, formatDuration, formatTimeRange, hexToRgba } from "@/lib/utils";

type EventBlockProps = {
  event: ScheduleEvent;
  top: number;
  height: number;
  widthPercent: number;
  leftPercent: number;
  isConflict: boolean;
  onClick: (event: ScheduleEvent) => void;
  onHoverChange?: (eventId: string | null) => void;
};

export function EventBlock({ event, top, height, widthPercent, leftPercent, isConflict, onClick, onHoverChange }: EventBlockProps) {
  const reduceMotion = useReducedMotion();
  const categoryMeta = CATEGORY_META[event.category];
  const Icon = categoryMeta.icon;
  const priority = PRIORITY_META[event.priority];
  const compact = height < 44;

  return (
    <TooltipPrimitive.Provider delayDuration={120}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          <motion.button
            type="button"
            aria-label={`${event.title}, ${formatTimeRange(event.startTime, event.endTime)}`}
            className={cn("group absolute z-20 overflow-hidden rounded-[22px] border text-left transition-all duration-150", isConflict && "animate-border-pulse")}
            style={{
              top,
              height,
              width: `calc(${widthPercent}% - 8px)`,
              left: `calc(${leftPercent}% + 4px)`,
              background: isConflict
                ? "linear-gradient(180deg, rgba(245,158,11,0.9), rgba(239,68,68,0.88))"
                : `linear-gradient(180deg, ${hexToRgba(event.color, 0.96)}, ${hexToRgba(event.color, 0.76)})`,
              borderColor: isConflict ? "rgba(239,68,68,0.28)" : hexToRgba(event.color, 0.55),
              boxShadow: "0 18px 36px rgba(15,23,42,0.18)"
            }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9, y: 8 }}
            animate={reduceMotion ? undefined : isConflict ? { opacity: 1, scale: 1, x: [0, -2, 2, 0], y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            whileHover={reduceMotion ? undefined : { scale: 1.02, y: -1 }}
            onMouseEnter={() => onHoverChange?.(event.id)}
            onMouseLeave={() => onHoverChange?.(null)}
            onFocus={() => onHoverChange?.(event.id)}
            onBlur={() => onHoverChange?.(null)}
            onClick={() => onClick(event)}
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent_40%)]" />
            <div className="relative flex h-full flex-col gap-1 px-3 py-2 text-white">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{event.title}</p>
                  {!compact ? <p className="mono-data text-[11px] text-white/80">{formatTimeRange(event.startTime, event.endTime)}</p> : null}
                </div>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-white/14">
                  <Icon className="h-3.5 w-3.5 text-white/90" />
                </span>
              </div>
              {!compact ? (
                <div className="mt-auto flex items-center justify-between gap-2 text-[11px] text-white/80">
                  <span className="truncate uppercase tracking-[0.18em]">{categoryMeta.label}</span>
                  <span className="rounded-full bg-white/14 px-2 py-0.5 text-white">{priority.label}</span>
                </div>
              ) : null}
            </div>
          </motion.button>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content side="top" sideOffset={10} className="glass-panel-strong z-50 max-w-xs rounded-2xl px-4 py-3 text-sm shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: event.color }} />
                <p className="font-semibold text-main">{event.title}</p>
              </div>
              <p className="mono-data text-xs text-soft">{formatTimeRange(event.startTime, event.endTime)}</p>
              {event.location ? <p className="text-soft">{event.location}</p> : null}
              <div className="flex items-center gap-2 text-xs text-soft">
                <span>{formatDuration(event.endTime - event.startTime)}</span>
                <span>•</span>
                <span>{priority.label} priority</span>
              </div>
              {isConflict ? <p className="text-xs font-medium text-[rgb(var(--amber))]">Conflict detected on this block.</p> : null}
            </div>
            <TooltipPrimitive.Arrow className="fill-[rgba(14,22,39,0.92)]" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
