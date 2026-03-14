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

export function EventBlock({
  event,
  top,
  height,
  widthPercent,
  leftPercent,
  isConflict,
  onClick,
  onHoverChange
}: EventBlockProps) {
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
            className={cn(
              "group absolute z-20 overflow-hidden rounded-2xl border px-2.5 py-2 text-left transition-all duration-150",
              isConflict && "animate-border-pulse"
            )}
            style={{
              top,
              height,
              width: `calc(${widthPercent}% - 6px)`,
              left: `calc(${leftPercent}% + 3px)`,
              backgroundColor: isConflict ? "rgba(245, 158, 11, 0.18)" : hexToRgba(event.color, 0.22),
              borderColor: isConflict ? "rgba(245, 158, 11, 0.4)" : hexToRgba(event.color, 0.45),
              boxShadow: isConflict ? "inset 4px 0 0 #ef4444" : undefined
            }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9, y: 8 }}
            animate={
              reduceMotion
                ? undefined
                : isConflict
                  ? { opacity: 1, scale: 1, x: [0, -2, 2, 0], y: 0 }
                  : { opacity: 1, scale: 1, y: 0 }
            }
            transition={{ duration: 0.22 }}
            whileHover={reduceMotion ? undefined : { scale: 1.02, y: -1 }}
            onMouseEnter={() => onHoverChange?.(event.id)}
            onMouseLeave={() => onHoverChange?.(null)}
            onFocus={() => onHoverChange?.(event.id)}
            onBlur={() => onHoverChange?.(null)}
            onClick={() => onClick(event)}
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 rounded-l-2xl" style={{ backgroundColor: isConflict ? "#EF4444" : event.color }} />
            <div className="relative flex h-full flex-col gap-1 pl-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white/95">{event.title}</p>
                  {!compact ? (
                    <p className="mono-data text-[11px] text-slate-300">{formatTimeRange(event.startTime, event.endTime)}</p>
                  ) : null}
                </div>
                <span
                  className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-white/10"
                  style={{ backgroundColor: hexToRgba(event.color, 0.24) }}
                >
                  <Icon className="h-3.5 w-3.5 text-white/90" />
                </span>
              </div>
              {!compact ? (
                <div className="mt-auto flex items-center justify-between gap-2 text-[11px] text-slate-300">
                  <span className="truncate uppercase tracking-[0.18em] text-slate-400">{categoryMeta.label}</span>
                  <span className="rounded-full px-2 py-0.5" style={{ backgroundColor: priority.softAccent, color: priority.accent }}>
                    {priority.label}
                  </span>
                </div>
              ) : null}
            </div>
          </motion.button>
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side="top"
            sideOffset={10}
            className="glass-panel-strong z-50 max-w-xs rounded-2xl px-4 py-3 text-sm text-slate-100 shadow-glow"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: event.color }} />
                <p className="font-semibold text-white">{event.title}</p>
              </div>
              <p className="mono-data text-xs text-slate-300">{formatTimeRange(event.startTime, event.endTime)}</p>
              {event.location ? <p className="text-slate-300">{event.location}</p> : null}
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span>{formatDuration(event.endTime - event.startTime)}</span>
                <span>•</span>
                <span>{priority.label} priority</span>
              </div>
              {isConflict ? <p className="text-xs font-medium text-amber-300">Conflict detected on this block.</p> : null}
            </div>
            <TooltipPrimitive.Arrow className="fill-slate-900/95" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
