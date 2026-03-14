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

  const merged = { ...DEFAULT_EVENT_DRAFT, ...initialDraft };
  return { ...merged, color: CATEGORY_META[merged.category].color };
}

export function AddEventModal({ open, editingEvent, initialDraft, existingEvents, onDelete, onOpenChange, onSave }: AddEventModalProps) {
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
    if (hasInvalidRange) return [];

    return existingEvents.filter((event) => {
      if (editingEvent && event.id === editingEvent.id) return false;
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
    if (!canSubmit) return;

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
              <motion.div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount>
              <motion.div initial={reduceMotion ? false : { opacity: 0, y: 70 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 70 }} transition={{ type: "spring", stiffness: 180, damping: 24 }} className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[32px] bg-transparent p-3 md:bottom-6 md:rounded-[32px]">
                <div className="glass-panel-strong rounded-[32px] p-6 shadow-2xl md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="section-kicker">{editingEvent ? "Edit Event" : "Add Event"}</p>
                      <DialogPrimitive.Title className="mt-2 text-3xl font-bold text-main">{editingEvent ? "Refine this schedule block" : "Create a new schedule block"}</DialogPrimitive.Title>
                      <DialogPrimitive.Description className="mt-2 text-sm text-soft">Configure timing, context, and priority. Conflicts are previewed live before you save.</DialogPrimitive.Description>
                    </div>
                    <DialogPrimitive.Close asChild>
                      <button type="button" className="button-ghost" aria-label="Close modal"><X className="h-4 w-4" /></button>
                    </DialogPrimitive.Close>
                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <label className="md:col-span-2">
                      <span className="mb-2 block text-sm font-medium text-soft">Title</span>
                      <input value={form.title} onChange={(event) => updateField("title", event.target.value)} className="field-shell" placeholder="e.g. Machine Learning Lecture" />
                    </label>

                    <div className="md:col-span-2">
                      <span className="mb-2 block text-sm font-medium text-soft">Day</span>
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                        {DAY_LABELS.map((label, index) => (
                          <button key={label} type="button" className={cn("rounded-2xl border px-3 py-3 text-sm font-medium transition-colors duration-150", form.day === index ? "border-[rgba(var(--accent),0.28)] bg-[rgba(var(--accent),0.12)] text-[rgb(var(--accent))]" : "surface-outline bg-[rgba(var(--background-soft),0.55)] text-soft")} onClick={() => updateField("day", index as EventDraft["day"])}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <label>
                      <span className="mb-2 block text-sm font-medium text-soft">Start Time</span>
                      <select value={form.startTime} onChange={(event) => updateField("startTime", Number(event.target.value))} className="field-shell">
                        {timeOptions.slice(0, -1).map((time) => <option key={time} value={time}>{formatMinutes(time)}</option>)}
                      </select>
                    </label>

                    <label>
                      <span className="mb-2 block text-sm font-medium text-soft">End Time</span>
                      <select value={form.endTime} onChange={(event) => updateField("endTime", Number(event.target.value))} className="field-shell">
                        {timeOptions.slice(1).map((time) => <option key={time} value={time}>{formatMinutes(time)}</option>)}
                      </select>
                    </label>

                    <div className="md:col-span-2">
                      <span className="mb-2 block text-sm font-medium text-soft">Category</span>
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                        {Object.entries(CATEGORY_META).map(([key, meta]) => {
                          const Icon = meta.icon;
                          const active = form.category === key;
                          return (
                            <button key={key} type="button" className={cn("rounded-2xl border px-3 py-3 text-left transition-colors duration-150", active ? "border-[rgba(var(--accent),0.22)] text-main" : "surface-outline bg-[rgba(var(--background-soft),0.55)] text-soft")} style={active ? { backgroundColor: meta.softColor } : undefined} onClick={() => updateField("category", key as EventDraft["category"])}>
                              <div className="flex items-center gap-2"><Icon className="h-4 w-4" style={{ color: meta.color }} /><span className="font-medium">{meta.label}</span></div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <label>
                      <span className="mb-2 block text-sm font-medium text-soft">Location</span>
                      <input value={form.location ?? ""} onChange={(event) => updateField("location", event.target.value)} className="field-shell" placeholder="Optional" />
                    </label>

                    <div>
                      <span className="mb-2 block text-sm font-medium text-soft">Priority</span>
                      <div className="grid grid-cols-3 gap-2">
                        {(["low", "medium", "high"] as const).map((priority) => (
                          <button key={priority} type="button" className={cn("rounded-2xl border px-3 py-3 text-sm font-medium capitalize transition-colors duration-150", form.priority === priority ? "border-[rgba(var(--accent),0.28)] bg-[rgba(var(--accent),0.12)] text-[rgb(var(--accent))]" : "surface-outline bg-[rgba(var(--background-soft),0.55)] text-soft")} onClick={() => updateField("priority", priority)}>{priority}</button>
                        ))}
                      </div>
                    </div>

                    <label className="md:col-span-2">
                      <span className="mb-2 block text-sm font-medium text-soft">Notes</span>
                      <textarea value={form.notes ?? ""} onChange={(event) => updateField("notes", event.target.value)} rows={4} className="field-shell" placeholder="Anything important to remember about this block?" />
                    </label>

                    <label className="inline-flex items-center gap-3 rounded-2xl border surface-outline bg-[rgba(var(--background-soft),0.55)] px-4 py-3 text-sm text-soft">
                      <input type="checkbox" checked={form.recurring} onChange={(event) => updateField("recurring", event.target.checked)} className="h-4 w-4 rounded border border-[rgba(var(--border),0.3)]" /> Repeat weekly
                    </label>
                  </div>

                  <div className="mt-5 space-y-3">
                    {hasInvalidRange ? <div className="rounded-2xl border border-[rgba(var(--danger),0.18)] bg-[rgba(var(--danger),0.08)] px-4 py-3 text-sm text-[rgb(var(--danger))]">End time must be later than the start time.</div> : null}
                    {conflicts.length ? <div className="rounded-2xl border border-[rgba(var(--amber),0.18)] bg-[rgba(var(--amber),0.1)] px-4 py-3 text-sm text-[rgb(var(--amber))]">Conflicts with {conflicts[0].title} on {DAY_LABELS[form.day]}{conflicts.length > 1 ? ` and ${conflicts.length - 1} more` : ""}. You can still save and resolve it later.</div> : null}
                  </div>

                  <div className="mt-6 flex flex-col-reverse gap-3 border-t surface-outline pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      {editingEvent ? <button type="button" className="button-danger" onClick={() => { onDelete(editingEvent.id); onOpenChange(false); }}><Trash2 className="h-4 w-4" /> Delete event</button> : null}
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <DialogPrimitive.Close asChild><button type="button" className="button-secondary">Cancel</button></DialogPrimitive.Close>
                      <button type="button" className={cn("button-primary", !canSubmit && "pointer-events-none opacity-50")} onClick={handleSubmit} disabled={!canSubmit}>{editingEvent ? "Save Changes" : "Create Event"}</button>
                    </div>
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
