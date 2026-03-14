import { DAY_NAMES, WORKING_DAY_END, WORKING_DAY_HOURS, WORKING_DAY_START } from "@/lib/constants";
import type { Conflict, DayAnalysis, GapSlot, ScheduleEvent, StudyWindow, WeeklyStats } from "@/lib/types";

function sortEvents(events: ScheduleEvent[]) {
  return [...events].sort((left, right) => {
    if (left.startTime === right.startTime) {
      return left.endTime - right.endTime;
    }

    return left.startTime - right.startTime;
  });
}

function clampInterval(startTime: number, endTime: number) {
  const start = Math.max(WORKING_DAY_START, startTime);
  const end = Math.min(WORKING_DAY_END, endTime);

  if (end <= start) {
    return null;
  }

  return { start, end };
}

function mergeIntervals(events: ScheduleEvent[]) {
  const intervals = sortEvents(events)
    .map((event) => clampInterval(event.startTime, event.endTime))
    .filter((interval): interval is { start: number; end: number } => Boolean(interval));

  if (!intervals.length) {
    return [];
  }

  const merged = [intervals[0]];

  for (let index = 1; index < intervals.length; index += 1) {
    const current = intervals[index];
    const last = merged[merged.length - 1];

    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end);
      continue;
    }

    merged.push({ ...current });
  }

  return merged;
}

function getGapNeighbors(gap: GapSlot, events: ScheduleEvent[]) {
  const dayEvents = sortEvents(events.filter((event) => event.day === gap.day));
  let previousEvent: ScheduleEvent | undefined;
  let nextEvent: ScheduleEvent | undefined;

  for (const event of dayEvents) {
    if (event.endTime <= gap.startTime) {
      if (!previousEvent || event.endTime > previousEvent.endTime) {
        previousEvent = event;
      }
    }

    if (event.startTime >= gap.endTime) {
      if (!nextEvent || event.startTime < nextEvent.startTime) {
        nextEvent = event;
      }
    }
  }

  return { previousEvent, nextEvent };
}

function buildStudyReason(
  gap: GapSlot,
  previousEvent?: ScheduleEvent,
  nextEvent?: ScheduleEvent
) {
  const descriptors: string[] = [];

  if (gap.startTime < 720) {
    descriptors.push("Morning slot");
  } else if (gap.startTime >= 840 && gap.endTime <= 1020) {
    descriptors.push("Prime afternoon window");
  } else if (gap.startTime >= 1200) {
    descriptors.push("Evening slot");
  } else {
    descriptors.push("Balanced mid-day gap");
  }

  if (previousEvent?.category === "class" || previousEvent?.category === "lab") {
    descriptors.push(`after ${previousEvent.title}`);
  } else if (nextEvent) {
    descriptors.push(`before ${nextEvent.title}`);
  } else {
    descriptors.push("with no immediate follow-up");
  }

  return descriptors.join(" ");
}

export function detectConflicts(events: ScheduleEvent[]): Conflict[] {
  const conflicts: Conflict[] = [];

  for (let day = 0; day < 7; day += 1) {
    const dayEvents = sortEvents(events.filter((event) => event.day === day));

    for (let index = 0; index < dayEvents.length; index += 1) {
      const current = dayEvents[index];

      for (let compareIndex = index + 1; compareIndex < dayEvents.length; compareIndex += 1) {
        const candidate = dayEvents[compareIndex];

        if (candidate.startTime >= current.endTime) {
          break;
        }

        if (current.startTime < candidate.endTime && candidate.startTime < current.endTime) {
          conflicts.push({
            eventA: current,
            eventB: candidate,
            overlapMinutes: Math.min(current.endTime, candidate.endTime) - Math.max(current.startTime, candidate.startTime)
          });
        }
      }
    }
  }

  return conflicts;
}

export function findGaps(events: ScheduleEvent[]): GapSlot[] {
  const gaps: GapSlot[] = [];

  for (let day = 0; day < 7; day += 1) {
    const mergedIntervals = mergeIntervals(events.filter((event) => event.day === day));

    if (!mergedIntervals.length) {
      gaps.push({
        day,
        startTime: WORKING_DAY_START,
        endTime: WORKING_DAY_END,
        durationMinutes: WORKING_DAY_END - WORKING_DAY_START
      });
      continue;
    }

    if (mergedIntervals[0].start - WORKING_DAY_START >= 30) {
      gaps.push({
        day,
        startTime: WORKING_DAY_START,
        endTime: mergedIntervals[0].start,
        durationMinutes: mergedIntervals[0].start - WORKING_DAY_START
      });
    }

    for (let index = 0; index < mergedIntervals.length - 1; index += 1) {
      const current = mergedIntervals[index];
      const next = mergedIntervals[index + 1];
      const gapDuration = next.start - current.end;

      if (gapDuration >= 30) {
        gaps.push({
          day,
          startTime: current.end,
          endTime: next.start,
          durationMinutes: gapDuration
        });
      }
    }

    const lastInterval = mergedIntervals[mergedIntervals.length - 1];
    if (WORKING_DAY_END - lastInterval.end >= 30) {
      gaps.push({
        day,
        startTime: lastInterval.end,
        endTime: WORKING_DAY_END,
        durationMinutes: WORKING_DAY_END - lastInterval.end
      });
    }
  }

  return gaps;
}

export function scoreStudyWindows(gaps: GapSlot[], events: ScheduleEvent[]): StudyWindow[] {
  return gaps
    .map((gap) => {
      const { previousEvent, nextEvent } = getGapNeighbors(gap, events);
      let score = Math.min(gap.durationMinutes, 120);

      if (gap.startTime < 720) {
        score += 20;
      }

      if (previousEvent?.category === "class" && previousEvent.priority === "high") {
        score += 15;
      }

      if (previousEvent && ["class", "lab"].includes(previousEvent.category)) {
        score += 10;
      }

      if (gap.startTime >= 1200) {
        score -= 10;
      }

      if (previousEvent?.category === "study" || nextEvent?.category === "study") {
        score -= 15;
      }

      if (gap.startTime >= 840 && gap.endTime <= 1020) {
        score += 10;
      }

      return {
        day: gap.day,
        startTime: gap.startTime,
        endTime: gap.endTime,
        score: Math.max(0, Math.min(100, score)),
        reason: buildStudyReason(gap, previousEvent, nextEvent)
      };
    })
    .sort((left, right) => {
      if (right.score === left.score) {
        if (left.day === right.day) {
          return left.startTime - right.startTime;
        }

        return left.day - right.day;
      }

      return right.score - left.score;
    })
    .slice(0, 5);
}

export function analyzeDays(events: ScheduleEvent[]): DayAnalysis[] {
  const conflicts = detectConflicts(events);

  return Array.from({ length: 7 }, (_, day) => {
    const dayEvents = sortEvents(events.filter((event) => event.day === day));
    const mergedIntervals = mergeIntervals(dayEvents);
    const busyMinutes = dayEvents.reduce((total, event) => total + Math.max(0, event.endTime - event.startTime), 0);
    const occupiedMinutes = mergedIntervals.reduce((total, interval) => total + (interval.end - interval.start), 0);
    const busyHours = busyMinutes / 60;
    const freeHours = Math.max(0, WORKING_DAY_HOURS - occupiedMinutes / 60);
    const conflictCount = conflicts.filter((conflict) => conflict.eventA.day === day).length;
    const overloadScore = Math.min(100, (busyHours / 8) * 100);

    return {
      day,
      totalHours: WORKING_DAY_HOURS,
      busyHours,
      freeHours,
      conflictCount,
      overloadScore,
      events: dayEvents
    };
  });
}

export function getWeeklyStats(events: ScheduleEvent[], days: DayAnalysis[]): WeeklyStats {
  const totalScheduledHours = events.reduce((total, event) => total + Math.max(0, event.endTime - event.startTime), 0) / 60;
  const conflicts = detectConflicts(events);
  const studyWindows = scoreStudyWindows(findGaps(events), events);
  const recommendedStudyHoursAvailable =
    studyWindows.reduce((total, window) => total + (window.endTime - window.startTime), 0) / 60;

  const busiest = [...days].sort((left, right) => right.busyHours - left.busyHours)[0];
  const freest = [...days].sort((left, right) => right.freeHours - left.freeHours)[0];

  return {
    totalScheduledHours,
    totalConflicts: conflicts.length,
    busiestDay: DAY_NAMES[busiest?.day ?? 0],
    freestDay: DAY_NAMES[freest?.day ?? 0],
    avgDailyLoad: totalScheduledHours / 7,
    recommendedStudyHoursAvailable
  };
}
