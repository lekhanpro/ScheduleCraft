"use client";

import { useEffect, useMemo, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { CATEGORY_META, DAY_LABELS, DEFAULT_EVENT_DRAFT } from "@/lib/constants";
import type { EventDraft, ScheduleEvent } from "@/lib/types";
import { buildTimeOptions, cn, formatMinutes } from "@/lib/utils";

type AddEventModalProps = {
  open: boolean;
  editingEvent: ScheduleEvent | null;
  initialDraft?: Partial<EventDraft> | null;
  existingEvents: ScheduleEvent[];
  onDelete: (id: string) => void;
  onOpenChange: (open: boolean) => void;
  onSave: (draft: Omit<ScheduleEvent, "id">, editingId?: string) => void;
};

function buildStartingDraft(editingEvent: ScheduleEvent | null, initialDraft?: Partial<EventDraft> | null): EventDraft {
  if (editingEvent) {
    return {
      title: editingEvent.title,
      day: editingEvent.day,
      startTime: editingEvent.startTime,
      endTime: editingEvent.endTime,
      category: editingEvent.category,
      color: editingEvent.color,
      location: editingEvent.location ?? "",
      recurring: editingEvent.recurring,
      priority: editingEvent.priority,
      notes: editingEvent.notes ?? ""
    };
  }

  const merged = {
    ...DEFAULT_EVENT_DRAFT,
    ...initialDraft
  };

  return {
    ...merged,
    color: CATEGORY_META[merged.category].color
  };
}

export function AddEventModal({
  open,
  editingEvent,
  initialDraft,
  existingEvents,
  onDelete,
  onOpenChange,
  onSave
}: AddEventModalProps) {
  const reduceMotion = useReducedMotion();
  const timeOptions = useMemo(() => buildTimeOptions(), []);
  const [form, setForm] = useState<EventDraft>(buildStartingDraft(editingEvent, initialDraft));

  useEffect(() => {
    if (open) {
      setForm(buildStartingDraft(editingEvent, initialDraft));
    }
  }, [editingEvent, initialDraft, open]);

  const hasInvalidRange = form.endTime <= form.startTime;

  const conflicts = useMemo(() => {
    if (hasInvalidRange) {
      return [];
    }

    return existingEvents.filter((event) => {
      if (editingEvent && event.id === editingEvent.id) {
        return false;
      }

      return event.day === form.day && form.startTime < event.endTime && event.startTime < form.endTime;
    });
  }, [editingEvent, existingEvents, form.day, form.endTime, form.startTime, hasInvalidRange]);

  const canSubmit = form.title.trim().length > 0 && !hasInvalidRange;

  function updateField<Key extends keyof EventDraft>(field: Key, value: EventDraft[Key]) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "category" ? { color: CATEGORY_META[value as EventDraft["category"]].color } : {})
    }));
  }

  function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    onSave(
      {
        ...form,
        title: form.title.trim(),
        location: form.location?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
        color: CATEGORY_META[form.category].color
      },
      editingEvent?.id
    );
    onOpenChange(false);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 80 }}
                transition={{ type: "spring", stiffness: 200, damping: 24 }}
                className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[32px] border border-white/10 bg-[#08101f]/95 p-6 shadow-2xl scrollbar-subtle md:bottom-6 md:rounded-[32px]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="section-kicker">{editingEvent ? "Edit Event" : "Add Event"}</p>
                    <DialogPrimitive.Title className="mt-2 text-2xl font-bold text-white">
                      {editingEvent ? "Refine this schedule block" : "Create a new schedule block"}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="mt-1 text-sm text-slate-400">
                      Fill in the essentials and ScheduleCraft will preview conflicts before you save.
                    </DialogPrimitive.Description>
                  </div>
                  <DialogPrimitive.Close asChild>
                    <button type="button" className="rounded-full border border-white/10 p-2 text-slate-300 hover:bg-white/10" aria-label="Close modal">
                      <X className="h-4 w-4" />
                    </button>
                  </DialogPrimitive.Close>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <label className="md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-200">Title</span>
                    <input
                      value={form.title}
                      onChange={(event) => updateField("title", event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500"
                      placeholder="e.g. Machine Learning Lecture"
                    />
                  </label>

                  <div className="md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-200">Day</span>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                      {DAY_LABELS.map((label, index) => (
                        <button
                          key={label}
                          type="button"
                          className={cn(
                            "rounded-2xl border px-3 py-3 text-sm font-medium transition-colors duration-150",
                            form.day === index ? "border-indigo-400/30 bg-indigo-500/18 text-white" : "border-white/10 bg-white/5 text-slate-300"
                          )}
                          onClick={() => updateField("day", index as EventDraft["day"])}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label>
                    <span className="mb-2 block text-sm font-medium text-slate-200">Start Time</span>
                    <select
                      value={form.startTime}
                      onChange={(event) => updateField("startTime", Number(event.target.value))}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
                    >
                      {timeOptions.slice(0, -1).map((time) => (
                        <option key={time} value={time} className="bg-slate-900">
                          {formatMinutes(time)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-medium text-slate-200">End Time</span>
                    <select
                      value={form.endTime}
                      onChange={(event) => updateField("endTime", Number(event.target.value))}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
                    >
                      {timeOptions.slice(1).map((time) => (
                        <option key={time} value={time} className="bg-slate-900">
                          {formatMinutes(time)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-200">Category</span>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                      {Object.entries(CATEGORY_META).map(([key, meta]) => {
                        const Icon = meta.icon;
                        const active = form.category === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            className={cn(
                              "rounded-2xl border px-3 py-3 text-left transition-colors duration-150",
                              active ? "border-white/10 text-white" : "border-white/10 bg-white/5 text-slate-300"
                            )}
                            style={active ? { backgroundColor: meta.softColor } : undefined}
                            onClick={() => updateField("category", key as EventDraft["category"])}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" style={{ color: meta.color }} />
                              <span className="font-medium">{meta.label}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label>
                    <span className="mb-2 block text-sm font-medium text-slate-200">Location</span>
                    <input
                      value={form.location ?? ""}
                      onChange={(event) => updateField("location", event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500"
                      placeholder="Optional"
                    />
                  </label>

                  <div>
                    <span className="mb-2 block text-sm font-medium text-slate-200">Priority</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(["low", "medium", "high"] as const).map((priority) => (
                        <button
                          key={priority}
                          type="button"
                          className={cn(
                            "rounded-2xl border px-3 py-3 text-sm font-medium capitalize transition-colors duration-150",
                            form.priority === priority ? "border-indigo-400/30 bg-indigo-500/18 text-white" : "border-white/10 bg-white/5 text-slate-300"
                          )}
                          onClick={() => updateField("priority", priority)}
                        >
                          {priority}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-200">Notes</span>
                    <textarea
                      value={form.notes ?? ""}
                      onChange={(event) => updateField("notes", event.target.value)}
                      rows={4}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500"
                      placeholder="Anything important to remember about this block?"
                    />
                  </label>

                  <label className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={form.recurring}
                      onChange={(event) => updateField("recurring", event.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-transparent text-indigo-500"
                    />
                    Repeat weekly
                  </label>
                </div>

                <div className="mt-5 space-y-3">
                  {hasInvalidRange ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                      <AlertTriangle className="mt-0.5 h-4 w-4" />
                      End time must be later than the start time.
                    </div>
                  ) : null}
                  {conflicts.length ? (
                    <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-50">
                      <AlertTriangle className="mt-0.5 h-4 w-4" />
                      <div>
                        <p className="font-medium text-amber-100">
                          Conflicts with {conflicts[0].title} on {DAY_LABELS[form.day]}{conflicts.length > 1 ? ` and ${conflicts.length - 1} more` : ""}.
                        </p>
                        <p className="mt-1 text-amber-100/80">You can still save, but this block will be flagged in the analyzer.</p>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    {editingEvent ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm font-semibold text-rose-100"
                        onClick={() => {
                          onDelete(editingEvent.id);
                          onOpenChange(false);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete event
                      </button>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <DialogPrimitive.Close asChild>
                      <button type="button" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
                        Cancel
                      </button>
                    </DialogPrimitive.Close>
                    <button
                      type="button"
                      className={cn(
                        "rounded-full px-5 py-3 text-sm font-semibold transition-transform duration-150",
                        canSubmit ? "bg-indigo-500 text-white hover:scale-[1.02]" : "bg-slate-800 text-slate-500"
                      )}
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                    >
                      {editingEvent ? "Save Changes" : "Create Event"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
