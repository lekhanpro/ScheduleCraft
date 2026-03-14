import {
  BookOpenText,
  Briefcase,
  Coffee,
  Dumbbell,
  FlaskConical,
  LucideIcon,
  Sparkles,
  Users2
} from "lucide-react";

import type { EventCategory, EventDraft, PriorityLevel, ScheduleEvent } from "@/lib/types";

export const WORKING_DAY_START = 420;
export const WORKING_DAY_END = 1320;
export const SLOT_MINUTES = 30;
export const WORKING_DAY_HOURS = (WORKING_DAY_END - WORKING_DAY_START) / 60;

export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

type CategoryMeta = {
  label: string;
  color: string;
  softColor: string;
  description: string;
  icon: LucideIcon;
};

export const CATEGORY_META: Record<EventCategory, CategoryMeta> = {
  class: {
    label: "Class",
    color: "#4F46E5",
    softColor: "rgba(79, 70, 229, 0.18)",
    description: "Lectures and core instruction",
    icon: BookOpenText
  },
  lab: {
    label: "Lab",
    color: "#06B6D4",
    softColor: "rgba(6, 182, 212, 0.18)",
    description: "Hands-on practical sessions",
    icon: FlaskConical
  },
  study: {
    label: "Study",
    color: "#10B981",
    softColor: "rgba(16, 185, 129, 0.18)",
    description: "Focused study and reading blocks",
    icon: Sparkles
  },
  meeting: {
    label: "Meeting",
    color: "#F59E0B",
    softColor: "rgba(245, 158, 11, 0.18)",
    description: "Group, seminar, or project time",
    icon: Users2
  },
  break: {
    label: "Break",
    color: "#94A3B8",
    softColor: "rgba(148, 163, 184, 0.18)",
    description: "Recovery and meal breaks",
    icon: Coffee
  },
  exercise: {
    label: "Exercise",
    color: "#F97316",
    softColor: "rgba(249, 115, 22, 0.18)",
    description: "Movement and training",
    icon: Dumbbell
  },
  personal: {
    label: "Personal",
    color: "#EC4899",
    softColor: "rgba(236, 72, 153, 0.18)",
    description: "Side projects and personal commitments",
    icon: Briefcase
  }
};

export const PRIORITY_META: Record<
  PriorityLevel,
  { label: string; accent: string; softAccent: string }
> = {
  low: {
    label: "Low",
    accent: "#94A3B8",
    softAccent: "rgba(148, 163, 184, 0.16)"
  },
  medium: {
    label: "Medium",
    accent: "#F59E0B",
    softAccent: "rgba(245, 158, 11, 0.16)"
  },
  high: {
    label: "High",
    accent: "#EF4444",
    softAccent: "rgba(239, 68, 68, 0.16)"
  }
};

export const DEFAULT_EVENT_DRAFT: EventDraft = {
  title: "",
  day: 0,
  startTime: 540,
  endTime: 600,
  category: "class",
  color: CATEGORY_META.class.color,
  location: "",
  recurring: true,
  priority: "medium",
  notes: ""
};

export const SEED_EVENTS: ScheduleEvent[] = [
  {
    id: "seed-mon-1",
    title: "Data Structures Lecture",
    day: 0,
    startTime: 540,
    endTime: 630,
    category: "class",
    color: CATEGORY_META.class.color,
    recurring: true,
    priority: "high",
    location: "Hall A1"
  },
  {
    id: "seed-mon-2",
    title: "DSA Lab",
    day: 0,
    startTime: 600,
    endTime: 720,
    category: "lab",
    color: CATEGORY_META.lab.color,
    recurring: true,
    priority: "high",
    location: "Lab 3"
  },
  {
    id: "seed-mon-3",
    title: "Lunch Break",
    day: 0,
    startTime: 720,
    endTime: 780,
    category: "break",
    color: CATEGORY_META.break.color,
    recurring: true,
    priority: "low"
  },
  {
    id: "seed-mon-4",
    title: "Algorithms",
    day: 0,
    startTime: 900,
    endTime: 990,
    category: "class",
    color: CATEGORY_META.class.color,
    recurring: true,
    priority: "high",
    location: "Auditorium 2"
  },
  {
    id: "seed-tue-1",
    title: "Operating Systems",
    day: 1,
    startTime: 480,
    endTime: 570,
    category: "class",
    color: CATEGORY_META.class.color,
    recurring: true,
    priority: "high",
    location: "Hall B2"
  },
  {
    id: "seed-tue-2",
    title: "OS Lab",
    day: 1,
    startTime: 840,
    endTime: 960,
    category: "lab",
    color: CATEGORY_META.lab.color,
    recurring: true,
    priority: "medium",
    location: "Systems Lab"
  },
  {
    id: "seed-tue-3",
    title: "Research Paper Reading",
    day: 1,
    startTime: 1020,
    endTime: 1110,
    category: "study",
    color: CATEGORY_META.study.color,
    recurring: true,
    priority: "medium",
    location: "Library"
  },
  {
    id: "seed-wed-1",
    title: "DBMS Lecture",
    day: 2,
    startTime: 540,
    endTime: 630,
    category: "class",
    color: CATEGORY_META.class.color,
    recurring: true,
    priority: "high",
    location: "Hall C1"
  },
  {
    id: "seed-wed-2",
    title: "Team Project Meeting",
    day: 2,
    startTime: 660,
    endTime: 720,
    category: "meeting",
    color: CATEGORY_META.meeting.color,
    recurring: true,
    priority: "medium",
    location: "Innovation Hub"
  },
  {
    id: "seed-wed-3",
    title: "DBMS Lecture 2",
    day: 2,
    startTime: 690,
    endTime: 780,
    category: "class",
    color: CATEGORY_META.class.color,
    recurring: true,
    priority: "high",
    location: "Hall C1"
  },
  {
    id: "seed-thu-1",
    title: "Gym",
    day: 3,
    startTime: 420,
    endTime: 480,
    category: "exercise",
    color: CATEGORY_META.exercise.color,
    recurring: true,
    priority: "medium",
    location: "Rec Center"
  },
  {
    id: "seed-thu-2",
    title: "Computer Networks",
    day: 3,
    startTime: 600,
    endTime: 690,
    category: "class",
    color: CATEGORY_META.class.color,
    recurring: true,
    priority: "high",
    location: "Hall D4"
  },
  {
    id: "seed-fri-1",
    title: "Seminar",
    day: 4,
    startTime: 840,
    endTime: 930,
    category: "meeting",
    color: CATEGORY_META.meeting.color,
    recurring: true,
    priority: "medium",
    location: "Seminar Room"
  },
  {
    id: "seed-fri-2",
    title: "Open Study",
    day: 4,
    startTime: 960,
    endTime: 1080,
    category: "study",
    color: CATEGORY_META.study.color,
    recurring: true,
    priority: "medium",
    location: "Library"
  },
  {
    id: "seed-sat-1",
    title: "Personal Project",
    day: 5,
    startTime: 600,
    endTime: 780,
    category: "personal",
    color: CATEGORY_META.personal.color,
    recurring: true,
    priority: "medium",
    location: "Studio"
  }
];
