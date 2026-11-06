"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Column, Heading, Row, Text, Textarea } from "@once-ui-system/core";
import type { EventType } from "@/lib/booking/config";
import { formatRange } from "@/lib/booking/time";
import { BookingFlow } from "./BookingFlow";
import styles from "./Booking.module.scss";

type Props = {
  token: string;
  ownerName: string;
  maxDaysAhead: number;
  eventType: EventType;
  start: string;
  end: string;
  guestName: string;
  meetLink?: string;
  isPast: boolean;
};

export function ManageBooking(p: Props) {
  const [tz, setTz] = useState("UTC");
  const [view, setView] = useState<"summary" | "reschedule" | "cancel" | "cancelled">("summary");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Column gap="24" fillWidth>
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          {view === "cancelled" ? "Booking cancelled" : p.eventType.title}
        </Heading>
        <Text onBackground="neutral-weak">
          With {p.ownerName} · {formatRange(p.start, p.end, tz)} ({tz})
        </Text>
      </Column>

      {view === "summary" &&
        (p.isPast ? (
          <Text onBackground="neutral-weak">This meeting has already happened.</Text>
        ) : (
          <Row gap="8" wrap>
            {p.meetLink && (
              <Button href={p.meetLink} prefixIcon="calendar">
                Join Google Meet
              </Button>
            )}
            <Button variant="secondary" onClick={() => setView("reschedule")}>
              Reschedule
            </Button>
            <Button variant="tertiary" onClick={() => setView("cancel")}>
              Cancel
            </Button>
          </Row>
        ))}

      {view === "reschedule" && (
        <Column gap="12" fillWidth>
          <Row>
            <Button variant="tertiary" size="s" onClick={() => setView("summary")}>
              ← Back
            </Button>
          </Row>
          <BookingFlow
            eventType={p.eventType}
            ownerName={p.ownerName}
            maxDaysAhead={p.maxDaysAhead}
            mode={{ kind: "reschedule", token: p.token, currentStart: p.start, currentEnd: p.end }}
          />
        </Column>
      )}

      {view === "cancel" && (
        <Column className={styles.panel} padding="l" gap="16">
          <Text>Cancel this meeting? {p.ownerName} will be notified.</Text>
          <Textarea
            id="reason"
            label="Reason (optional)"
            lines={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {error && (
            <Text variant="body-default-s" onBackground="danger-weak">
              {error}
            </Text>
          )}
          <Row gap="8">
            <Button variant="danger" onClick={cancel} loading={busy} disabled={busy}>
              Cancel meeting
            </Button>
            <Button variant="tertiary" onClick={() => setView("summary")}>
              Keep it
            </Button>
          </Row>
        </Column>
      )}

      {view === "cancelled" && (
        <Text onBackground="neutral-weak">
          The calendar invite has been removed. You can{" "}
          <Link href="/book">book another time</Link> whenever you like.
        </Text>
      )}
    </Column>
  );
}
