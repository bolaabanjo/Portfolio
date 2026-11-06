"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { EventType } from "@/lib/booking/config";
import { formatInTz } from "@/lib/booking/time";
import { BookingFlow } from "./BookingFlow";
import styles from "./Booking.module.scss";

type Props = {
  token: string;
  ownerName: string;
  ownerAvatar?: string;
  maxDaysAhead: number;
  eventType: EventType;
  start: string;
  end: string;
  guestName: string;
  meetLink?: string;
  isPast: boolean;
  initialView?: "summary" | "reschedule" | "cancel";
};

type View = "summary" | "reschedule" | "cancel" | "cancelled";

const clock = (iso: string, tz: string) =>
  formatInTz(iso, tz, { hour: "numeric", minute: "2-digit" }).replace(" AM", "am").replace(" PM", "pm");

function zoneLabel(tz: string, at: string) {
  const offset =
    new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" })
      .formatToParts(new Date(at))
      .find((p) => p.type === "timeZoneName")?.value ?? "";
  return `${tz.split("/").pop()!.replace(/_/g, " ")}, ${offset === "GMT" ? "GMT+0" : offset}`;
}

const BadgeIcons = {
  calendar: (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
};

const MeetLogo = (
  <Image src="/images/google-meet.svg" alt="" width={16} height={13} unoptimized className={styles.brandIcon} />
);

export function ManageBooking(p: Props) {
  const [tz, setTz] = useState<string | null>(null);
  const [view, setView] = useState<View>(p.isPast ? "summary" : (p.initialView ?? "summary"));
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The visitor's timezone is only known in the browser.
  useEffect(() => setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"), []);

  async function cancel() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/book/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: p.token, action: "cancel", reason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setView("cancelled");
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Could not cancel");
    } finally {
      setBusy(false);
    }
  }

  if (view === "reschedule") {
    return (
      <div className={styles.rescheduleWrap}>
        <button type="button" className={styles.backLink} onClick={() => setView("summary")}>
          ← Back to booking
        </button>
        <BookingFlow
          eventType={p.eventType}
          ownerName={p.ownerName}
          ownerAvatar={p.ownerAvatar}
          maxDaysAhead={p.maxDaysAhead}
          mode={{ kind: "reschedule", token: p.token, currentStart: p.start, currentEnd: p.end }}
        />
      </div>
    );
  }

  const ownerFirst = p.ownerName.split(/\s+/)[0];
  const title = p.eventType.title;
  const cancelled = view === "cancelled";

  const status = cancelled
    ? { label: "Cancelled", tone: styles.pillRed, icon: BadgeIcons.x }
    : p.isPast
      ? { label: "Past", tone: "", icon: BadgeIcons.clock }
      : { label: "Upcoming", tone: styles.pillGreen, icon: BadgeIcons.calendar };

  const heading = cancelled
    ? `${title} cancelled`
    : view === "cancel"
      ? `Cancel this ${title.toLowerCase()}?`
      : `${title} with ${p.ownerName}`;

  const sub = cancelled
    ? "The calendar invite has been removed."
    : view === "cancel"
      ? `${ownerFirst} will be notified. Add a reason if you like.`
      : p.isPast
        ? "This chat has already happened."
        : `Hi ${p.guestName.split(/\s+/)[0]}, here are your booking details.`;

  return (
    <section className={styles.manageCard}>
      {p.ownerAvatar && (
        <Image className={styles.manageAvatar} src={p.ownerAvatar} alt="" width={48} height={48} unoptimized />
      )}
      <span className={`${styles.statusPill} ${status.tone}`}>
        {status.icon}
        {status.label}
      </span>
      <h1 className={styles.manageTitle}>{heading}</h1>
      <p className={styles.manageSub}>{sub}</p>

      <dl className={styles.manageDetails}>
        <div>
          <dt>When</dt>
          <dd className={cancelled ? styles.struckText : undefined}>
            {tz ? (
              <>
                {formatInTz(p.start, tz, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                <br />
                <span className={styles.mutedText}>
                  {clock(p.start, tz)} – {clock(p.end, tz)} ({zoneLabel(tz, p.start)})
                </span>
              </>
            ) : (
              <span className={styles.mutedText}>…</span>
            )}
          </dd>
        </div>
        {!cancelled && (
          <div>
            <dt>Where</dt>
            <dd>
              Google Meet
              {p.meetLink && (
                <>
                  <br />
                  <a href={p.meetLink} className={styles.detailLink}>
                    {p.meetLink.replace(/^https?:\/\//, "")}
                  </a>
                </>
              )}
            </dd>
          </div>
        )}
        <div>
          <dt>Who</dt>
          <dd>
            {p.ownerName} <span className={styles.mutedText}>(host)</span>
            <br />
            {p.guestName}
          </dd>
        </div>
      </dl>

      {view === "summary" && !p.isPast && (
        <div className={styles.manageActions}>
          {p.meetLink && (
            <a href={p.meetLink} className={styles.primaryBtn}>
              {MeetLogo}
              Join Google Meet
            </a>
          )}
          <button type="button" className={styles.outlineBtn} onClick={() => setView("reschedule")}>
            Reschedule
          </button>
          <button type="button" className={styles.ghostBtn} onClick={() => setView("cancel")}>
            Cancel
          </button>
        </div>
      )}

      {view === "summary" && p.isPast && (
        <div className={styles.manageActions}>
          <Link href="/chat" className={styles.primaryBtn}>
            Book another chat
          </Link>
        </div>
      )}

      {view === "cancel" && (
        <form
          className={styles.cancelForm}
          onSubmit={(e) => {
            e.preventDefault();
            if (!busy) cancel();
          }}
        >
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Reason</span>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              rows={3}
              placeholder="Optional"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              autoFocus
            />
          </label>
          {error && <p className={styles.fieldError}>{error}</p>}
          <div className={styles.manageActions}>
            <button type="button" className={styles.ghostBtn} onClick={() => setView("summary")} disabled={busy}>
              Keep it
            </button>
            <button type="submit" className={styles.dangerBtn} disabled={busy}>
              {busy ? "Cancelling…" : `Cancel ${title.toLowerCase()}`}
            </button>
          </div>
        </form>
      )}

      {cancelled && (
        <div className={styles.manageActions}>
          <Link href="/chat" className={styles.primaryBtn}>
            Book another time
          </Link>
        </div>
      )}
    </section>
  );
}
