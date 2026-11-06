"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Availability, Override } from "@/lib/booking/availability";
import type { Window } from "@/lib/booking/config";
import { TimezoneSelect } from "./TimezoneSelect";
import styles from "./Admin.module.scss";

type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6;
const DAYS: { d: Day; name: string }[] = [
  { d: 0, name: "Sunday" },
  { d: 1, name: "Monday" },
  { d: 2, name: "Tuesday" },
  { d: 3, name: "Wednesday" },
  { d: 4, name: "Thursday" },
  { d: 5, name: "Friday" },
  { d: 6, name: "Saturday" },
];
const DEFAULT_WINDOW: Window = { start: "09:00", end: "17:00" };

// ---- Time helpers -------------------------------------------------------------

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const fromMin = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

function label(t: string) {
  const m = toMin(t);
  if (m === 24 * 60) return "12:00am";
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  return `${h % 12 === 0 ? 12 : h % 12}:${mm}${h < 12 ? "am" : "pm"}`;
}

const STEP = 15;
const START_OPTIONS = Array.from({ length: (24 * 60) / STEP }, (_, i) => fromMin(i * STEP)); // 00:00 … 23:45
const END_OPTIONS = Array.from({ length: (24 * 60) / STEP }, (_, i) => fromMin((i + 1) * STEP)); // 00:15 … 24:00

function windowError(windows: Window[]): string | null {
  const sorted = [...windows].sort((a, b) => a.start.localeCompare(b.start));
  for (const w of sorted) if (w.start >= w.end) return "End time must be after start time";
  for (let i = 1; i < sorted.length; i++) if (sorted[i].start < sorted[i - 1].end) return "Time ranges overlap";
  return null;
}

function nextWindow(windows: Window[]): Window | null {
  if (windows.length === 0) return DEFAULT_WINDOW;
  const lastEnd = Math.max(...windows.map((w) => toMin(w.end)));
  if (lastEnd >= 24 * 60 - STEP) return null;
  return { start: fromMin(lastEnd), end: fromMin(Math.min(lastEnd + 60, 24 * 60)) };
}

function todayIn(tz: string) {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return p; // en-CA formats as YYYY-MM-DD
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${date}T12:00:00Z`),
  );
}

const summary = (windows: Window[]) =>
  windows.length === 0 ? "Unavailable" : windows.map((w) => `${label(w.start)} – ${label(w.end)}`).join(", ");

// ---- Small pieces -------------------------------------------------------------

function Switch({ checked, onChange, label: aria }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={aria}
      className={styles.switch}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

function IconButton({ title, onClick, disabled, children }: { title: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" className={styles.iconButton} title={title} aria-label={title} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

const PlusIcon = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const CopyIcon = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
  </svg>
);
const XIcon = (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const BackIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

function TimeSelect({ value, options, onChange, ariaLabel }: { value: string; options: string[]; onChange: (v: string) => void; ariaLabel: string }) {
  return (
    <select className={styles.timeSelect} value={value} onChange={(e) => onChange(e.target.value)} aria-label={ariaLabel}>
      {options.map((t) => (
        <option key={t} value={t}>
          {label(t)}
        </option>
      ))}
    </select>
  );
}

/** Start–end pickers for a list of windows, with a remove button per window. */
function WindowsEditor({ windows, onChange, labelPrefix }: { windows: Window[]; onChange: (w: Window[]) => void; labelPrefix: string }) {
  const err = windowError(windows);
  return (
    <div className={styles.windows}>
      {windows.map((w, i) => (
        <div key={i} className={styles.windowRow}>
          <TimeSelect
            value={w.start}
            options={START_OPTIONS}
            ariaLabel={`${labelPrefix} start time ${i + 1}`}
            onChange={(v) => onChange(windows.map((x, j) => (j === i ? { ...x, start: v } : x)))}
          />
          <span className={styles.dash}>–</span>
          <TimeSelect
            value={w.end}
            options={END_OPTIONS}
            ariaLabel={`${labelPrefix} end time ${i + 1}`}
            onChange={(v) => onChange(windows.map((x, j) => (j === i ? { ...x, end: v } : x)))}
          />
          <IconButton title="Remove time range" onClick={() => onChange(windows.filter((_, j) => j !== i))}>
            {XIcon}
          </IconButton>
        </div>
      ))}
      {err && <p className={styles.fieldError}>{err}</p>}
    </div>
  );
}

/** "Copy times to…" popover for one weekday. */
function CopyMenu({ from, onApply, onClose }: { from: Day; onApply: (days: Day[]) => void; onClose: () => void }) {
  const [selected, setSelected] = useState<Set<Day>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const others = DAYS.filter((x) => x.d !== from);
  const allOn = others.every((x) => selected.has(x.d));
  const toggle = (d: Day) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(d) ? n.delete(d) : n.add(d);
      return n;
    });

  return (
    <div className={styles.copyMenu} ref={ref} role="dialog" aria-label="Copy times to">
      <p className={styles.copyTitle}>Copy times to</p>
      <label className={styles.check}>
        <input type="checkbox" checked={allOn} onChange={() => setSelected(allOn ? new Set() : new Set(others.map((x) => x.d)))} />
        Select all
      </label>
      {others.map((x) => (
        <label key={x.d} className={styles.check}>
          <input type="checkbox" checked={selected.has(x.d)} onChange={() => toggle(x.d)} />
          {x.name}
        </label>
      ))}
      <div className={styles.copyActions}>
        <button type="button" className={styles.ghostButton} onClick={onClose}>
          Cancel
        </button>
        <button type="button" className={styles.solidButton} disabled={selected.size === 0} onClick={() => onApply([...selected])}>
          Apply
        </button>
      </div>
    </div>
  );
}

// ---- Override form ------------------------------------------------------------

function OverrideForm({
  initial,
  minDate,
  takenDates,
  onSave,
  onCancel,
}: {
  initial?: Override;
  minDate: string;
  takenDates: Set<string>;
  onSave: (o: Override) => void;
  onCancel: () => void;
}) {
  const [date, setDate] = useState(initial?.date ?? "");
  const [unavailable, setUnavailable] = useState(initial ? initial.windows.length === 0 : false);
  const [windows, setWindows] = useState<Window[]>(initial?.windows.length ? initial.windows : [DEFAULT_WINDOW]);

  const dateTaken = !!date && date !== initial?.date && takenDates.has(date);
  const err = !unavailable ? windowError(windows) || (windows.length === 0 ? "Add at least one time range" : null) : null;
  const canSave = !!date && date >= minDate && !dateTaken && !err;

  return (
    <div className={styles.overrideForm}>
      <label className={styles.fieldLabel}>
        Date
        <input type="date" className={styles.dateInput} value={date} min={minDate} onChange={(e) => setDate(e.target.value)} />
      </label>
      {dateTaken && <p className={styles.fieldError}>There&apos;s already an override for this date.</p>}

      <div className={styles.overrideToggle}>
        <Switch checked={unavailable} onChange={setUnavailable} label="Unavailable all day" />
        <span>Unavailable all day</span>
      </div>

      {!unavailable && (
        <div className={styles.overrideWindows}>
          <WindowsEditor windows={windows} onChange={setWindows} labelPrefix="Override" />
          <button
            type="button"
            className={styles.linkButton}
            disabled={!nextWindow(windows)}
            onClick={() => {
              const n = nextWindow(windows);
              if (n) setWindows([...windows, n]);
            }}
          >
            + Add time range
          </button>
        </div>
      )}

      <div className={styles.formActions}>
        <button type="button" className={styles.ghostButton} onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className={styles.solidButton}
          disabled={!canSave}
          onClick={() => onSave({ date, windows: unavailable ? [] : windows })}
        >
          {initial ? "Update override" : "Add override"}
        </button>
      </div>
    </div>
  );
}

// ---- Page ---------------------------------------------------------------------

export function AdminAvailability({ initial }: { initial: Availability }) {
  const [avail, setAvail] = useState<Availability>(initial);
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(initial));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [copyFrom, setCopyFrom] = useState<Day | null>(null);
  const [editing, setEditing] = useState<"new" | string | null>(null); // override date being edited
  // Remember a day's hours when it's switched off, so switching back on restores them.
  const remembered = useRef<Partial<Record<Day, Window[]>>>({});

  const today = useMemo(() => todayIn(avail.timezone), [avail.timezone]);
  const dirty = JSON.stringify(avail) !== savedJson;
  const hasErrors =
    DAYS.some(({ d }) => windowError(avail.weeklyHours[d])) || avail.overrides.some((o) => windowError(o.windows));

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const setDay = (d: Day, windows: Window[]) =>
    setAvail((a) => ({ ...a, weeklyHours: { ...a.weeklyHours, [d]: windows } }));

  function toggleDay(d: Day, on: boolean) {
    if (on) {
      setDay(d, remembered.current[d]?.length ? remembered.current[d]! : [DEFAULT_WINDOW]);
    } else {
      remembered.current[d] = avail.weeklyHours[d];
      setDay(d, []);
    }
  }

  function copyTo(from: Day, targets: Day[]) {
    setAvail((a) => {
      const weeklyHours = { ...a.weeklyHours };
      for (const t of targets) weeklyHours[t] = a.weeklyHours[from].map((w) => ({ ...w }));
      return { ...a, weeklyHours };
    });
    setCopyFrom(null);
  }

  function saveOverride(o: Override, replacing?: string) {
    setAvail((a) => ({
      ...a,
      overrides: [...a.overrides.filter((x) => x.date !== o.date && x.date !== replacing), o].sort((x, y) =>
        x.date.localeCompare(y.date),
      ),
    }));
    setEditing(null);
  }

  async function save() {
    setSaving(true);
    setStatus(null);
    // Past overrides no longer matter; drop them on save.
    const payload = { ...avail, overrides: avail.overrides.filter((o) => o.date >= today) };
    try {
      const res = await fetch("/api/book/admin/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not save");
      setAvail(json);
      setSavedJson(JSON.stringify(json));
      setStatus({ kind: "ok", text: "Saved" });
      setTimeout(() => setStatus((s) => (s?.kind === "ok" ? null : s)), 2500);
    } catch (e) {
      setStatus({ kind: "error", text: e instanceof Error ? e.message : "Could not save" });
    } finally {
      setSaving(false);
    }
  }

  const upcoming = avail.overrides.filter((o) => o.date >= today);
  const takenDates = new Set(avail.overrides.map((o) => o.date));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <Link href="/chat/admin" className={styles.back} aria-label="Back to bookings">
            {BackIcon}
          </Link>
          <h1>Working hours</h1>
        </div>
        <div className={styles.headerActions}>
          {status && (
            <span className={status.kind === "ok" ? styles.statusOk : styles.statusError} role="status">
              {status.text}
            </span>
          )}
          {dirty && !status && <span className={styles.statusMuted}>Unsaved changes</span>}
          <button type="button" className={styles.solidButton} onClick={save} disabled={!dirty || saving || hasErrors}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.main}>
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h2>Weekly hours</h2>
              <p>Set the times you are available each day</p>
            </div>

            {DAYS.map(({ d, name }) => {
              const windows = avail.weeklyHours[d];
              const on = windows.length > 0;
              return (
                <div key={d} className={styles.dayRow}>
                  <div className={styles.dayName}>
                    <Switch checked={on} onChange={(v) => toggleDay(d, v)} label={`${name} available`} />
                    <span>{name}</span>
                  </div>
                  <div className={styles.dayWindows}>
                    {on ? (
                      <WindowsEditor windows={windows} onChange={(w) => setDay(d, w)} labelPrefix={name} />
                    ) : (
                      <span className={styles.unavailable}>Unavailable</span>
                    )}
                  </div>
                  <div className={styles.dayActions}>
                    <IconButton
                      title={`Add time range to ${name}`}
                      disabled={!nextWindow(windows)}
                      onClick={() => {
                        const n = nextWindow(windows);
                        if (n) setDay(d, [...windows, n]);
                      }}
                    >
                      {PlusIcon}
                    </IconButton>
                    <div className={styles.copyWrap}>
                      <IconButton title={`Copy ${name}'s times to other days`} onClick={() => setCopyFrom(copyFrom === d ? null : d)}>
                        {CopyIcon}
                      </IconButton>
                      {copyFrom === d && <CopyMenu from={d} onApply={(days) => copyTo(d, days)} onClose={() => setCopyFrom(null)} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          <section className={styles.card}>
            <div className={`${styles.cardHead} ${styles.cardHeadRow}`}>
              <div>
                <h2>Date overrides</h2>
                <p>Add dates when your availability changes from your weekly hours.</p>
              </div>
              {editing !== "new" && (
                <button type="button" className={styles.outlineButton} onClick={() => setEditing("new")}>
                  {PlusIcon} Add an override
                </button>
              )}
            </div>

            {editing === "new" && (
              <OverrideForm minDate={today} takenDates={takenDates} onSave={(o) => saveOverride(o)} onCancel={() => setEditing(null)} />
            )}

            {upcoming.map((o) =>
              editing === o.date ? (
                <OverrideForm
                  key={o.date}
                  initial={o}
                  minDate={today}
                  takenDates={takenDates}
                  onSave={(n) => saveOverride(n, o.date)}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <div key={o.date} className={styles.overrideRow}>
                  <button type="button" className={styles.overrideInfo} onClick={() => setEditing(o.date)}>
                    <span className={styles.overrideDate}>{formatDate(o.date)}</span>
                    <span className={styles.overrideHours}>{summary(o.windows)}</span>
                  </button>
                  <IconButton
                    title={`Remove override for ${formatDate(o.date)}`}
                    onClick={() => setAvail((a) => ({ ...a, overrides: a.overrides.filter((x) => x.date !== o.date) }))}
                  >
                    {XIcon}
                  </IconButton>
                </div>
              ),
            )}
          </section>
        </div>

        <aside className={styles.side}>
          <label className={styles.fieldLabel} htmlFor="owner-tz">
            Timezone
          </label>
          <TimezoneSelect id="owner-tz" variant="field" value={avail.timezone} onChange={(tz) => setAvail((a) => ({ ...a, timezone: tz }))} />
          <p className={styles.sideNote}>
            Your hours are in this timezone. Visitors see them converted to their own.
          </p>

          <div className={styles.sideCard}>
            <p>Want to check how it looks?</p>
            <Link href="/chat" className={styles.outlineButton} target="_blank">
              Open booking page
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
