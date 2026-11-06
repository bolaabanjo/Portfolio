"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Column, Input, PasswordInput, Row, Text } from "@once-ui-system/core";
import { addDays, formatRange } from "@/lib/booking/time";
import styles from "./Booking.module.scss";

type AdminBooking = {
  id: string;
  title: string;
  start: string;
  end: string;
  guestName: string;
  guestEmail: string;
  meetLink?: string;
  description?: string;
};

type Block = { id: string; summary: string; from: string; to: string };

async function call(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json;
}

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      await call("/api/book/admin/login", "POST", { password });
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Column gap="12">
      <PasswordInput
        id="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        errorMessage={error}
      />
      <Row>
        <Button onClick={submit} loading={busy}>
          Sign in
        </Button>
      </Row>
    </Column>
  );
}

export function AdminPanel({
  timezone,
  bookings,
  blocks,
}: {
  timezone: string;
  bookings: AdminBooking[];
  blocks: Block[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blockFrom, setBlockFrom] = useState("");
  const [blockTo, setBlockTo] = useState("");
  const [note, setNote] = useState("");

  async function run(key: string, fn: () => Promise<unknown>) {
    setPending(key);
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setPending(null);
    }
  }

  return (
    <Column gap="32" fillWidth>
      {error && <Text onBackground="danger-weak">{error}</Text>}

      <Column gap="8" fillWidth>
        <Text variant="heading-strong-m">Upcoming ({bookings.length})</Text>
        <Column className={styles.panel} paddingX="l" paddingY="8" fillWidth>
          {bookings.length === 0 && (
            <Text onBackground="neutral-weak" variant="body-default-s" paddingY="12">
              No upcoming bookings.
            </Text>
          )}
          {bookings.map((b) => (
            <Column key={b.id} className={styles.row} gap="4">
              <Row horizontal="between" vertical="center" gap="12" wrap>
                <Column gap="2">
                  <Text variant="heading-strong-s">
                    {b.guestName} · {b.title}
                  </Text>
                  <Text variant="body-default-s" onBackground="neutral-weak">
                    {formatRange(b.start, b.end, timezone)} · {b.guestEmail}
                  </Text>
                </Column>
                <Row gap="8">
                  {b.meetLink && (
                    <Button size="s" variant="secondary" href={b.meetLink}>
                      Meet
                    </Button>
                  )}
                  <Button
                    size="s"
                    variant="tertiary"
                    loading={pending === b.id}
                    onClick={() => {
                      const reason = window.prompt(`Cancel with ${b.guestName}? Optional reason:`);
                      if (reason === null) return;
                      run(b.id, () => call("/api/book/admin/cancel", "POST", { id: b.id, reason }));
                    }}
                  >
                    Cancel
                  </Button>
                </Row>
              </Row>
              {b.description && (
                <Text
                  variant="body-default-s"
                  onBackground="neutral-weak"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {b.description.replace(/\n*Reschedule or cancel: \S+$/, "")}
                </Text>
              )}
            </Column>
          ))}
        </Column>
      </Column>

      <Column gap="8" fillWidth>
        <Text variant="heading-strong-m">Blocked days</Text>
        <Column className={styles.panel} padding="l" gap="12" fillWidth>
          <Row gap="8" wrap vertical="end">
            <Input id="from" type="date" label="From" value={blockFrom} onChange={(e) => setBlockFrom(e.target.value)} />
            <Input id="to" type="date" label="To (optional)" value={blockTo} onChange={(e) => setBlockTo(e.target.value)} />
            <Input id="note" label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
          </Row>
          <Row>
            <Button
              size="s"
              disabled={!blockFrom}
              loading={pending === "block"}
              onClick={() =>
                run("block", async () => {
                  await call("/api/book/admin/block", "POST", { from: blockFrom, to: blockTo || blockFrom, note });
                  setBlockFrom("");
                  setBlockTo("");
                  setNote("");
                })
              }
            >
              Block
            </Button>
          </Row>
          {blocks.map((bl) => (
            <Row key={bl.id} className={styles.row} horizontal="between" vertical="center">
              <Text variant="body-default-s">
                {bl.from}
                {addDays(bl.to, -1) !== bl.from ? ` → ${addDays(bl.to, -1)}` : ""} · {bl.summary}
              </Text>
              <Button
                size="s"
                variant="tertiary"
                loading={pending === bl.id}
                onClick={() => run(bl.id, () => call(`/api/book/admin/block?id=${encodeURIComponent(bl.id)}`, "DELETE"))}
              >
                Remove
              </Button>
            </Row>
          ))}
        </Column>
      </Column>

      <Row>
        <Button
          size="s"
          variant="tertiary"
          onClick={() => run("logout", () => call("/api/book/admin/login", "DELETE"))}
        >
          Sign out
        </Button>
      </Row>
    </Column>
  );
}
