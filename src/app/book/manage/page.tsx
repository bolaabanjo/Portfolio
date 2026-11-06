import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { loadBooking } from "@/lib/booking/bookings";
import { bookingConfig } from "@/lib/booking/config";
import { readManageToken } from "@/lib/booking/tokens";
import { ManageBooking } from "@/components/book/ManageBooking";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Manage booking", robots: { index: false } };

type Props = { searchParams: Promise<{ t?: string }> };

export default async function Manage({ searchParams }: Props) {
  const token = (await searchParams).t ?? "";
  const id = readManageToken(token);
  const booking = id ? await loadBooking(id) : null;

  return (
    <Column fillWidth style={{ maxWidth: 900 }} gap="l" paddingY="12" paddingX="l">
      {!booking ? (
        <Column gap="8">
          <Heading as="h1" variant="display-strong-xs">
            {id ? "Booking not found" : "Invalid link"}
          </Heading>
          <Text onBackground="neutral-weak">
            {id
              ? "This booking has already been cancelled or no longer exists."
              : "This link is invalid. Check the link in your confirmation email."}
          </Text>
        </Column>
      ) : (
        <ManageBooking
          token={token}
          ownerName={bookingConfig.ownerName}
          maxDaysAhead={bookingConfig.rules.maxDaysAhead}
          eventType={booking.type}
          start={booking.start}
          end={booking.end}
          guestName={booking.guestName}
          meetLink={booking.meetLink}
          isPast={Date.parse(booking.start) < Date.now()}
        />
      )}
    </Column>
  );
}
