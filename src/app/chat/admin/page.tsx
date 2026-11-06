import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { toBooking } from "@/lib/booking/bookings";
import { bookingConfig } from "@/lib/booking/config";
import { listTagged } from "@/lib/booking/google";
import { ADMIN_COOKIE, isAdminSession } from "@/lib/booking/tokens";
import { AdminLogin, AdminPanel } from "@/components/book/AdminPanel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Bookings admin", robots: { index: false } };

export default async function Admin() {
  const authed = isAdminSession((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!authed) {
    return (
      <Column fillWidth style={{ maxWidth: 420 }} paddingY="64" paddingX="l" gap="16">
        <Heading as="h1" variant="heading-strong-l">
          Bookings admin
        </Heading>
        <AdminLogin />
      </Column>
    );
  }

  const from = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const to = new Date(Date.now() + 120 * 24 * 60 * 60 * 1000);
  let error: string | null = null;
  let bookings: ReturnType<typeof toBooking>[] = [];
  let blocks: { id: string; summary: string; from: string; to: string }[] = [];

  try {
    const [b, bl] = await Promise.all([listTagged("booking", from, to), listTagged("block", from, to)]);
    bookings = b.map(toBooking).filter(Boolean);
    blocks = bl.map((e) => ({
      id: e.id,
      summary: e.summary ?? "Unavailable",
      from: e.start.date ?? "",
      to: e.end.date ?? "",
    }));
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load calendar";
  }

  return (
    <Column fillWidth style={{ maxWidth: 900 }} paddingY="12" paddingX="l" gap="l">
      <Heading as="h1" variant="display-strong-xs">
        Bookings
      </Heading>
      {error ? (
        <Text onBackground="danger-weak">{error}</Text>
      ) : (
        <AdminPanel
          timezone={bookingConfig.timezone}
          bookings={bookings.map((b) => ({
            id: b!.id,
            title: b!.type.title,
            start: b!.start,
            end: b!.end,
            guestName: b!.guestName,
            guestEmail: b!.guestEmail,
            meetLink: b!.meetLink,
            description: b!.description,
          }))}
          blocks={blocks}
        />
      )}
    </Column>
  );
}
