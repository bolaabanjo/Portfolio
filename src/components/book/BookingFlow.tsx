"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Button, Input, Spinner, Textarea } from "@once-ui-system/core";
import type { EventType } from "@/lib/booking/config";
import { addDays, dateKey, formatInTz, formatRange, weekdayOf, zonedToUtc } from "@/lib/booking/time";
import styles from "./Booking.module.scss";
import { TimezoneSelect } from "./TimezoneSelect";

type Mode = { kind: "book" } | { kind: "reschedule"; token: string; currentStart: string; currentEnd: string };

type Props = {
  eventType: EventType;
  ownerName: string;
  ownerAvatar?: string;
  maxDaysAhead: number;
  mode?: Mode;
};

type Confirmed = { start: string; end: string; meetLink?: string; manageUrl?: string };

const WEEKDAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const pad = (n: number) => String(n).padStart(2, "0");

const Icon = {
  clock: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  ),
  chevron: (dir: "left" | "right" | "down") => (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: dir === "left" ? "rotate(180deg)" : dir === "down" ? "rotate(90deg)" : undefined }}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  ),
};

export function BookingFlow({ eventType, ownerName, ownerAvatar, maxDaysAhead, mode = { kind: "book" } }: Props) {
  const [tz, setTz] = useState<string | null>(null);
  const [hour12, setHour12] = useState(true);
  const [month, setMonth] = useState<{ y: number; m: number } | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [step, setStep] = useState<"pick" | "details">("pick");
  const [form, setForm] = useState<Record<string, string>>({ name: "", email: "", website: "" });
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);

  // Timezone, clock format and "today" depend on the browser, so set them after mount.
  useEffect(() => {
    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    setTz(browserTz);
    setHour12(new Intl.DateTimeFormat(undefined, { hour: "numeric" }).resolvedOptions().hour12 ?? true);
    const [y, m] = dateKey(new Date(), browserTz).split("-").map(Number);
    setMonth({ y, m });
  }, []);

  const rescheduleToken = mode.kind === "reschedule" ? mode.token : null;
  const today = tz ? dateKey(new Date(), tz) : "";
  const lastBookable = tz ? dateKey(new Date(Date.now() + maxDaysAhead * 86400000), tz) : "";
  const monthStart = month ? `${month.y}-${pad(month.m)}-01` : "";
  const daysInMonth = month ? new Date(Date.UTC(month.y, month.m, 0)).getUTCDate() : 0;

  const loadSlots = useCallback(async () => {
    if (!tz || !month) return;
    setLoading(true);
    setError(null);
    const qs = new URLSearchParams({
      from: zonedToUtc(monthStart, "00:00", tz).toISOString(),
      to: zonedToUtc(addDays(monthStart, daysInMonth), "00:00", tz).toISOString(),
    });
    if (rescheduleToken) qs.set("t", rescheduleToken);
    else qs.set("type", eventType.slug);
    try {
      const res = await fetch(`/api/book/slots?${qs}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSlots(json.slots);
    } catch (e) {
      setSlots([]);
      setError(e instanceof Error && e.message ? e.message : "Could not load availability");
    } finally {
      setLoading(false);
    }
  }, [tz, month, monthStart, daysInMonth, eventType.slug, rescheduleToken]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const byDay = useMemo(() => {
    const map = new Map<string, string[]>();
    if (!tz) return map;
    for (const s of slots) {
      const k = dateKey(new Date(s), tz);
      map.set(k, [...(map.get(k) ?? []), s]);
    }
    return map;
  }, [slots, tz]);

  // Pick the first available day in the visible month if nothing valid is selected.
  useEffect(() => {
    if (loading) return;
    if (selectedDay && byDay.has(selectedDay)) return;
    setSelectedDay(byDay.keys().next().value ?? null);
  }, [byDay, loading, selectedDay]);

  if (!tz || !month) {
    return (
      <div className={styles.card}>
        <div className={styles.loadingCard}>
          <Spinner />
        </div>
      </div>
    );
  }

  const canGoBack = monthStart > `${today.slice(0, 8)}01`;
  const canGoForward = addDays(monthStart, daysInMonth) <= lastBookable;
  const shiftMonth = (delta: number) => {
    const d = new Date(Date.UTC(month.y, month.m - 1 + delta, 1));
    setMonth({ y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 });
    setSelectedDay(null);
  };

  const fmtTime = (iso: string) =>
    formatInTz(iso, tz, { hour: "numeric", minute: "2-digit", hour12 }).replace(" AM", "am").replace(" PM", "pm");
  const endOf = (iso: string) => new Date(Date.parse(iso) + eventType.duration * 60000).toISOString();
  const dayLabel = (key: string, opts: Intl.DateTimeFormatOptions) =>
    formatInTz(zonedToUtc(key, "12:00", "UTC"), "UTC", opts);

  async function submit() {
    if (!selectedSlot) return;
    setSubmitting(true);
    setError(null);
    try {
      const res =
        mode.kind === "reschedule"
          ? await fetch("/api/book/manage", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ t: mode.token, action: "reschedule", start: selectedSlot }),
            })
          : await fetch("/api/book", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: eventType.slug,
                start: selectedSlot,
                name: form.name,
                email: form.email,
                website: form.website,
                timezone: tz,
                answers: Object.fromEntries((eventType.questions ?? []).map((q) => [q.id, form[`q_${q.id}`] ?? ""])),
              }),
            });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setSelectedSlot(null);
          setStep("pick");
          loadSlots();
        }
        throw new Error(json.error);
      }
      setConfirmed(json);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  function pickSlot(s: string) {
    setSelectedSlot(s);
    setError(null);
    if (mode.kind === "book") setStep("details");
  }

  // ---- Confirmation -------------------------------------------------------
  if (confirmed) {
    return (
      <div className={`${styles.card} ${styles.cardNarrow}`}>
        <div className={styles.confirm}>
          <span className={styles.checkBadge}>{Icon.check}</span>
          <h2 className={styles.confirmTitle}>
            {mode.kind === "reschedule" ? "Your call was rescheduled" : "This call is scheduled"}
          </h2>
          <p className={styles.muted}>A calendar invite with the Google Meet link has been sent to your email.</p>
          <dl className={styles.summary}>
            <dt>What</dt>
            <dd>
              {eventType.title} with {ownerName}
            </dd>
            <dt>When</dt>
            <dd>
              {formatRange(confirmed.start, confirmed.end, tz)}
              <br />
              <span className={styles.muted}>{tz.replace(/_/g, " ")}</span>
            </dd>
            <dt>Where</dt>
            <dd>{confirmed.meetLink ? <a href={confirmed.meetLink}>Google Meet</a> : "Google Meet"}</dd>
          </dl>
          {confirmed.manageUrl && (
            <p className={styles.muted}>
              Need to make a change? <a href={confirmed.manageUrl}>Reschedule or cancel</a>
            </p>
          )}
        </div>
      </div>
    );
  }

  // ---- Left info panel ----------------------------------------------------
  const info = (
    <aside className={styles.info}>
      {ownerAvatar && <Image className={styles.avatar} src={ownerAvatar} alt="" width={28} height={28} unoptimized />}
      <p className={styles.owner}>{ownerName}</p>
      <h1 className={styles.eventTitle}>{mode.kind === "reschedule" ? `Reschedule: ${eventType.title}` : eventType.title}</h1>
      {mode.kind === "reschedule" && (
        <p className={`${styles.meta} ${styles.strike}`}>
          {Icon.calendar}
          <span>{formatRange(mode.currentStart, mode.currentEnd, tz)}</span>
        </p>
      )}
      {step === "details" && selectedSlot && (
        <p className={styles.meta}>
          {Icon.calendar}
          <span>{formatRange(selectedSlot, endOf(selectedSlot), tz)}</span>
        </p>
      )}
      <p className={styles.meta}>
        {Icon.clock}
        <span>{eventType.duration}m</span>
      </p>
      <p className={styles.meta}>
        <Image src="/images/google-meet.svg" alt="" width={16} height={13} unoptimized className={styles.brandIcon} />
        <span>Google Meet</span>
      </p>
      <TimezoneSelect
        value={tz}
        onChange={setTz}
        disabled={step === "details"}
        icon={Icon.globe}
        chevron={Icon.chevron("down")}
      />
      {eventType.description && step === "pick" && <p className={styles.description}>{eventType.description}</p>}
    </aside>
  );

  // ---- Details form -------------------------------------------------------
  if (step === "details" && selectedSlot) {
    const requiredMissing =
      !form.name.trim() ||
      !form.email.trim() ||
      (eventType.questions ?? []).some((q) => q.required && !form[`q_${q.id}`]?.trim());
    return (
      <div className={`${styles.card} ${styles.cardDetails}`}>
        {info}
        <form
          className={styles.details}
          onSubmit={(e) => {
            e.preventDefault();
            if (!requiredMissing) submit();
          }}
        >
          <Input
            id="name"
            label="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            autoComplete="name"
          />
          <Input
            id="email"
            label="Email address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="email"
          />
          {(eventType.questions ?? []).map((q) =>
            q.type === "textarea" ? (
              <Textarea
                key={q.id}
                id={`q_${q.id}`}
                label={q.label}
                placeholder={q.placeholder}
                lines={4}
                value={form[`q_${q.id}`] ?? ""}
                onChange={(e) => setForm({ ...form, [`q_${q.id}`]: e.target.value })}
              />
            ) : (
              <Input
                key={q.id}
                id={`q_${q.id}`}
                label={q.label}
                placeholder={q.placeholder}
                value={form[`q_${q.id}`] ?? ""}
                onChange={(e) => setForm({ ...form, [`q_${q.id}`]: e.target.value })}
              />
            ),
          )}
          {/* Honeypot: hidden from people, filled in by naive bots. */}
          <input
            className={styles.hp}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.formActions}>
            <Button
              type="button"
              variant="tertiary"
              onClick={() => {
                setStep("pick");
                setError(null);
              }}
            >
              Back
            </Button>
            <Button type="submit" loading={submitting} disabled={submitting || requiredMissing}>
              Confirm
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // ---- Calendar + times ---------------------------------------------------
  const leadingBlanks = weekdayOf(monthStart);
  const daySlots = selectedDay ? byDay.get(selectedDay) ?? [] : [];

  return (
    <div className={styles.card}>
      {info}

      <section className={styles.calendar}>
        <header className={styles.monthHeader}>
          <h2>
            <strong>{dayLabel(monthStart, { month: "long" })}</strong>{" "}
            <span className={styles.muted}>{month.y}</span>
          </h2>
          <div className={styles.monthNav}>
            <button type="button" disabled={!canGoBack} onClick={() => shiftMonth(-1)} aria-label="Previous month">
              {Icon.chevron("left")}
            </button>
            <button type="button" disabled={!canGoForward} onClick={() => shiftMonth(1)} aria-label="Next month">
              {Icon.chevron("right")}
            </button>
          </div>
        </header>

        <div className={styles.grid}>
          {WEEKDAY_LABELS.map((d) => (
            <span key={d} className={styles.weekday}>
              {d}
            </span>
          ))}
          {Array.from({ length: leadingBlanks }, (_, i) => (
            <span key={`b${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const key = addDays(monthStart, i);
            const available = byDay.has(key);
            return (
              <button
                key={key}
                type="button"
                disabled={!available}
                aria-pressed={key === selectedDay}
                className={[
                  styles.day,
                  available && styles.available,
                  key === selectedDay && styles.selected,
                  key === today && styles.today,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedDay(key)}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {loading && (
          <div className={styles.overlay}>
            <Spinner />
          </div>
        )}
        {!loading && error && <p className={styles.error}>{error}</p>}
        {!loading && !error && byDay.size === 0 && (
          <p className={styles.empty}>
            No open times this month.
            {canGoForward && (
              <button type="button" className={styles.linkButton} onClick={() => shiftMonth(1)}>
                View next month
              </button>
            )}
          </p>
        )}
      </section>

      <section className={styles.times}>
        <header className={styles.timesHeader}>
          <h2>
            {selectedDay ? (
              <>
                <strong>{dayLabel(selectedDay, { weekday: "short" })}</strong>{" "}
                <span className={styles.muted}>{dayLabel(selectedDay, { day: "numeric" })}</span>
              </>
            ) : (
              <span className={styles.muted}>Pick a day</span>
            )}
          </h2>
          <div className={styles.segmented} role="group" aria-label="Time format">
            <button type="button" aria-pressed={hour12} onClick={() => setHour12(true)}>
              12h
            </button>
            <button type="button" aria-pressed={!hour12} onClick={() => setHour12(false)}>
              24h
            </button>
          </div>
        </header>
        <div className={styles.timeList}>
          {daySlots.map((s) => (
            <button
              key={s}
              type="button"
              className={`${styles.time} ${s === selectedSlot ? styles.selected : ""}`}
              onClick={() => pickSlot(s)}
            >
              {fmtTime(s)}
            </button>
          ))}
        </div>
        {mode.kind === "reschedule" && selectedSlot && (
          <div className={styles.rescheduleConfirm}>
            {error && <p className={styles.error}>{error}</p>}
            <Button fillWidth onClick={submit} loading={submitting} disabled={submitting}>
              Move to {fmtTime(selectedSlot)}
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
