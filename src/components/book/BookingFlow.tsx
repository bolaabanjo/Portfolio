"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Column, Heading, Input, Row, Spinner, Text, Textarea } from "@once-ui-system/core";
import type { EventType } from "@/lib/booking/config";
import { addDays, dateKey, formatInTz, formatRange, weekdayOf, zonedToUtc } from "@/lib/booking/time";
import styles from "./Booking.module.scss";

type Mode = { kind: "book" } | { kind: "reschedule"; token: string; currentStart: string; currentEnd: string };

type Props = {
  eventType: EventType;
  ownerName: string;
  maxDaysAhead: number;
  mode?: Mode;
};

type Confirmed = { start: string; end: string; meetLink?: string; manageUrl?: string };

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad = (n: number) => String(n).padStart(2, "0");

function timeZones(current: string) {
  const list =
    typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];
  return list.includes(current) ? list : [current, ...list];
}

export function BookingFlow({ eventType, ownerName, maxDaysAhead, mode = { kind: "book" } }: Props) {
  const [tz, setTz] = useState<string | null>(null);
  const [month, setMonth] = useState<{ y: number; m: number } | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({ name: "", email: "", website: "" });
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);

  // Timezone and "today" depend on the browser, so set them after mount.
  useEffect(() => {
    const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    setTz(browserTz);
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
    const nextMonth = addDays(monthStart, daysInMonth);
    const qs = new URLSearchParams({
      from: zonedToUtc(monthStart, "00:00", tz).toISOString(),
      to: zonedToUtc(nextMonth, "00:00", tz).toISOString(),
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
    setSelectedSlot(null);
  }, [byDay, loading, selectedDay]);

  if (!tz || !month) {
    return (
      <Row fillWidth horizontal="center" paddingY="64">
        <Spinner />
      </Row>
    );
  }

  const canGoBack = monthStart > today.slice(0, 8) + "01";
  const canGoForward = addDays(monthStart, daysInMonth) <= lastBookable;
  const shiftMonth = (delta: number) => {
    const d = new Date(Date.UTC(month.y, month.m - 1 + delta, 1));
    setMonth({ y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 });
    setSelectedDay(null);
    setSelectedSlot(null);
  };

  const fmtTime = (iso: string) => formatInTz(iso, tz, { hour: "numeric", minute: "2-digit" });
  const endOf = (iso: string) => new Date(Date.parse(iso) + eventType.duration * 60000).toISOString();

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
                answers: Object.fromEntries(
                  (eventType.questions ?? []).map((q) => [q.id, form[`q_${q.id}`] ?? ""]),
                ),
              }),
            });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setSelectedSlot(null);
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

  if (confirmed) {
    return (
      <Column className={styles.panel} gap="16" padding="l" fillWidth>
        <Heading as="h2" variant="heading-strong-l">
          {mode.kind === "reschedule" ? "Rescheduled" : "You're booked"}
        </Heading>
        <Text onBackground="neutral-weak">
          {eventType.title} with {ownerName}
          <br />
          {formatRange(confirmed.start, confirmed.end, tz)} ({tz})
        </Text>
        <Text variant="body-default-s" onBackground="neutral-weak">
          A calendar invite has been sent to your email.
        </Text>
        <Row gap="8" wrap>
          {confirmed.meetLink && (
            <Button href={confirmed.meetLink} prefixIcon="calendar" size="s">
              Google Meet link
            </Button>
          )}
          {confirmed.manageUrl && (
            <Button href={confirmed.manageUrl} variant="secondary" size="s">
              Reschedule or cancel
            </Button>
          )}
        </Row>
      </Column>
    );
  }

  const leadingBlanks = weekdayOf(monthStart);
  const daySlots = selectedDay ? byDay.get(selectedDay) ?? [] : [];
  const requiredMissing =
    mode.kind === "book" &&
    (!form.name.trim() ||
      !form.email.trim() ||
      (eventType.questions ?? []).some((q) => q.required && !form[`q_${q.id}`]?.trim()));

  return (
    <Column gap="24" fillWidth>
      {mode.kind === "reschedule" && (
        <Text variant="body-default-s" onBackground="neutral-weak">
          Currently: {formatRange(mode.currentStart, mode.currentEnd, tz)}
        </Text>
      )}

      <div className={styles.layout}>
        <Column className={styles.panel} padding="m" gap="12">
          <Row horizontal="between" vertical="center">
            <Text variant="heading-strong-s">
              {formatInTz(zonedToUtc(monthStart, "12:00", "UTC"), "UTC", { month: "long", year: "numeric" })}
            </Text>
            <Row gap="4">
              <Button size="s" variant="tertiary" disabled={!canGoBack} onClick={() => shiftMonth(-1)} aria-label="Previous month">
                ‹
              </Button>
              <Button size="s" variant="tertiary" disabled={!canGoForward} onClick={() => shiftMonth(1)} aria-label="Next month">
                ›
              </Button>
            </Row>
          </Row>

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
                  className={`${styles.day} ${available ? styles.available : ""} ${
                    key === selectedDay ? styles.selected : ""
                  } ${key === today ? styles.today : ""}`}
                  onClick={() => {
                    setSelectedDay(key);
                    setSelectedSlot(null);
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <label className={styles.tz}>
            <Text variant="label-default-s" onBackground="neutral-weak">
              Timezone
            </Text>
            <select value={tz} onChange={(e) => setTz(e.target.value)}>
              {timeZones(tz).map((z) => (
                <option key={z} value={z}>
                  {z.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>
        </Column>

        <Column className={styles.panel} padding="m" gap="12">
          {loading ? (
            <Row fillWidth horizontal="center" paddingY="32">
              <Spinner />
            </Row>
          ) : !selectedDay ? (
            <Text onBackground="neutral-weak" variant="body-default-s">
              No open times this month.{canGoForward ? " Try the next one." : ""}
            </Text>
          ) : (
            <>
              <Text variant="heading-strong-s">
                {formatInTz(zonedToUtc(selectedDay, "12:00", "UTC"), "UTC", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
              <div className={styles.times}>
                {daySlots.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`${styles.time} ${s === selectedSlot ? styles.selected : ""}`}
                    onClick={() => setSelectedSlot(s)}
                  >
                    {fmtTime(s)}
                  </button>
                ))}
              </div>
            </>
          )}
        </Column>
      </div>

      {selectedSlot && (
        <Column className={styles.panel} padding="l" gap="16" fillWidth>
          <Text variant="heading-strong-s">
            {formatRange(selectedSlot, endOf(selectedSlot), tz)}
          </Text>

          {mode.kind === "book" && (
            <>
              <Input
                id="name"
                label="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
              />
              <Input
                id="email"
                label="Email"
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
            </>
          )}

          {error && (
            <Text variant="body-default-s" onBackground="danger-weak">
              {error}
            </Text>
          )}

          <Row>
            <Button onClick={submit} loading={submitting} disabled={submitting || requiredMissing}>
              {mode.kind === "reschedule" ? "Confirm new time" : "Confirm booking"}
            </Button>
          </Row>
        </Column>
      )}

      {error && !selectedSlot && (
        <Text variant="body-default-s" onBackground="danger-weak">
          {error}
        </Text>
      )}
    </Column>
  );
}
