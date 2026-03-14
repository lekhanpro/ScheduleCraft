"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { DAY_LABELS, SLOT_MINUTES, WORKING_DAY_END, WORKING_DAY_START } from "@/lib/constants";
import type { ActiveView, DayAnalysis, ScheduleEvent } from "@/lib/types";
import { formatHourLabel, formatTimeRange, getDayName } from "@/lib/utils";
import { DayOverloadBadge } from "@/components/DayOverloadBadge";
import { EventBlock } from "@/components/EventBlock";

type WeeklyGridProps = {
  activeView: ActiveView;
  conflictEventIds: Set<string>;
  dayAnalyses: DayAnalysis[];
  events: ScheduleEvent[];
  onCreateEvent: (day: number, startTime: number, endTime?: number) => void;
  onEditEvent: (event: ScheduleEvent) => void;
  onHoverEvent: (eventId: string | null) => void;
  onSelectDay: (day: number) => void;
  selectedDay: number;
  todayIndex: number;
  weekDates: Date[];
};

type LayoutMeta = {
  lane: number;
  laneCount: number;
};

const ROW_HEIGHT = 30;
const TOTAL_ROWS = (WORKING_DAY_END - WORKING_DAY_START) / SLOT_MINUTES;
const GRID_HEIGHT = TOTAL_ROWS * ROW_HEIGHT;

function computeLayouts(events: ScheduleEvent[]) {
  const sorted = [...events].sort((left, right) => {
    if (left.startTime === right.startTime) {
      return left.endTime - right.endTime;
    }

    return left.startTime - right.startTime;
  });

  const layoutMap = new Map<string, LayoutMeta>();
  let active: Array<{ endTime: number; lane: number }> = [];
  let cluster: Array<{ id: string; lane: number }> = [];
  let clusterLaneCount = 1;

  const flush = () => {
    cluster.forEach((entry) => {
      layoutMap.set(entry.id, { lane: entry.lane, laneCount: clusterLaneCount });
    });
    cluster = [];
    clusterLaneCount = 1;
  };

  for (const event of sorted) {
    active = active.filter((item) => item.endTime > event.startTime);

    if (!active.length && cluster.length) {
      flush();
    }

    let lane = 0;
    while (active.some((item) => item.lane === lane)) {
      lane += 1;
    }

    active.push({ endTime: event.endTime, lane });
    cluster.push({ id: event.id, lane });
    clusterLaneCount = Math.max(clusterLaneCount, ...active.map((item) => item.lane + 1));
  }

  if (cluster.length) {
    flush();
  }

  return layoutMap;
}

export function WeeklyGrid({
  activeView,
  conflictEventIds,
  dayAnalyses,
  events,
  onCreateEvent,
  onEditEvent,
  onHoverEvent,
  onSelectDay,
  selectedDay,
  todayIndex,
  weekDates
}: WeeklyGridProps) {
  const reduceMotion = useReducedMotion();
  const [currentMinutes, setCurrentMinutes] = useState<number | null>(null);
  const timeLabels = useMemo(() => Array.from({ length: 16 }, (_, index) => WORKING_DAY_START + index * 60), []);
  const slotTimes = useMemo(() => Array.from({ length: TOTAL_ROWS }, (_, index) => WORKING_DAY_START + index * SLOT_MINUTES), []);
  const daysToRender = activeView === "week" ? weekDates.map((_, index) => index) : [selectedDay];

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    };

    update();
    const interval = window.setInterval(update, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const layoutsByDay = useMemo(() => {
    const map = new Map<number, Map<string, LayoutMeta>>();
    daysToRender.forEach((day) => {
      map.set(day, computeLayouts(events.filter((event) => event.day === day)));
    });
    return map;
  }, [daysToRender, events]);

  const dayAnalysisMap = useMemo(() => new Map(dayAnalyses.map((day) => [day.day, day])), [dayAnalyses]);
  const showNowLine = currentMinutes !== null && currentMinutes >= WORKING_DAY_START && currentMinutes <= WORKING_DAY_END;
  const mobileEvents = [...events.filter((event) => event.day === selectedDay)].sort((left, right) => left.startTime - right.startTime);

  return (
    <section className="glass-panel rounded-[28px] p-4 md:p-5">
      <div className="md:hidden">
        <div className="scrollbar-subtle mb-4 flex gap-2 overflow-x-auto pb-1">
          {DAY_LABELS.map((label, index) => (
            <button
              key={label}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium ${selectedDay === index ? "bg-indigo-500 text-white" : "border border-white/10 bg-white/5 text-slate-300"}`}
              onClick={() => onSelectDay(index)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {mobileEvents.length ? (
            mobileEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                className="glass-panel-strong flex w-full items-start justify-between rounded-[24px] p-4 text-left"
                onClick={() => onEditEvent(event)}
              >
                <div>
                  <p className="text-lg font-semibold text-white">{event.title}</p>
                  <p className="mt-1 mono-data text-sm text-slate-300">{formatTimeRange(event.startTime, event.endTime)}</p>
                  {event.location ? <p className="mt-2 text-sm text-slate-400">{event.location}</p> : null}
                </div>
                {conflictEventIds.has(event.id) ? <AlertTriangle className="h-5 w-5 text-amber-300" /> : null}
              </button>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-slate-400">
              No events on {getDayName(selectedDay)}. Tap below to add one.
            </div>
          )}
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-500 px-4 py-3 text-sm font-semibold text-white"
            onClick={() => onCreateEvent(selectedDay, 540)}
          >
            <Plus className="h-4 w-4" />
            Add event to {getDayName(selectedDay)}
          </button>
        </div>
      </div>

      <div className="hidden md:block">
        <div
          className="grid rounded-[24px] border border-white/10 bg-slate-950/30"
          style={{ gridTemplateColumns: `60px repeat(${daysToRender.length}, minmax(0, 1fr))` }}
        >
          <div className="border-b border-white/10 p-3" />
          {daysToRender.map((day, index) => {
            const date = weekDates[day];
            const analysis = dayAnalysisMap.get(day);
            const isToday = day === todayIndex;

            return (
              <motion.button
                key={day}
                type="button"
                className={`border-b border-l border-white/10 px-3 py-4 text-left ${activeView === "day" || selectedDay === day ? "bg-white/5" : "bg-transparent"}`}
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectDay(day)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{DAY_LABELS[day]}</p>
                      {isToday ? <span className="rounded-full bg-indigo-500/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-indigo-100">Today</span> : null}
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                  </div>
                  {analysis ? <DayOverloadBadge day={analysis} /> : null}
                </div>
              </motion.button>
            );
          })}

          <div className="relative h-[900px] border-r border-white/10">
            {timeLabels.map((time) => (
              <span
                key={time}
                className="mono-data absolute left-2 -translate-y-1/2 text-xs text-slate-500"
                style={{ top: time === WORKING_DAY_END ? GRID_HEIGHT : time - WORKING_DAY_START }}
              >
                {formatHourLabel(time)}
              </span>
            ))}
          </div>

          {daysToRender.map((day, index) => {
            const dayEvents = events.filter((event) => event.day === day);
            const layout = layoutsByDay.get(day) ?? new Map<string, LayoutMeta>();

            return (
              <motion.div
                key={day}
                className="relative border-l border-white/10"
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <div className="relative h-[900px]">
                  {slotTimes.map((time) => (
                    <button
                      key={`${day}-${time}`}
                      type="button"
                      aria-label={`Add event on ${getDayName(day)} at ${formatHourLabel(time)}`}
                      className="group absolute inset-x-0 border-b border-white/5 transition-colors duration-150 hover:bg-white/5"
                      style={{ top: time - WORKING_DAY_START, height: ROW_HEIGHT }}
                      onClick={() => onCreateEvent(day, time, Math.min(time + 60, WORKING_DAY_END))}
                    >
                      <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-1 text-slate-300 group-hover:inline-flex">
                        <Plus className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  ))}

                  {showNowLine ? (
                    <div className="pointer-events-none absolute inset-x-0 z-10" style={{ top: currentMinutes! - WORKING_DAY_START }}>
                      <div className="h-px bg-rose-400" />
                      <div className="absolute -top-1.5 left-0 h-3 w-3 rounded-full bg-rose-400" />
                    </div>
                  ) : null}

                  {dayEvents.map((event) => {
                    const meta = layout.get(event.id) ?? { lane: 0, laneCount: 1 };
                    return (
                      <EventBlock
                        key={event.id}
                        event={event}
                        top={event.startTime - WORKING_DAY_START}
                        height={Math.max((event.endTime - event.startTime) / SLOT_MINUTES * ROW_HEIGHT, 24)}
                        widthPercent={100 / meta.laneCount}
                        leftPercent={(100 / meta.laneCount) * meta.lane}
                        isConflict={conflictEventIds.has(event.id)}
                        onClick={onEditEvent}
                        onHoverChange={onHoverEvent}
                      />
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
