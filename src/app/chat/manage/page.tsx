import type { Metadata } from "next";
import Link from "next/link";
import { loadBooking } from "@/lib/booking/bookings";
import { bookingConfig } from "@/lib/booking/config";
import { readManageToken } from "@/lib/booking/tokens";
import { ManageBooking } from "@/components/book/ManageBooking";
import styles from "@/components/book/Booking.module.scss";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Manage booking", robots: { index: false } };

type Props = { searchParams: Promise<{ t?: string; a?: string }> };

export default async function Manage({ searchParams }: Props) {
  const params = await searchParams;
  const token = params.t ?? "";
  // Email links deep-link straight to an action: ?a=reschedule or ?a=cancel
  const initialView = params.a === "reschedule" || params.a === "cancel" ? params.a : "summary";
  const id = readManageToken(token);
  const booking = id ? await loadBooking(id) : null;

  return (
    <div className={styles.page}>
      {!booking ? (
        <section className={styles.manageCard}>
          <span className={styles.statusPill}>{id ? "Not found" : "Invalid link"}</span>
          <h1 className={styles.manageTitle}>{id ? "Booking not found" : "This link doesn't work"}</h1>
          <p className={styles.manageSub}>
            {id
              ? "This booking has already been cancelled or no longer exists."
              : "Check the link in your confirmation email, or book a new time."}
          </p>
          <div className={styles.manageActions}>
            <Link href="/chat" className={styles.primaryBtn}>
              Book a chat
            </Link>
          </div>
        </section>
      ) : (
        <ManageBooking
          token={token}
          initialView={initialView}
          ownerName={bookingConfig.ownerName}
          ownerAvatar={bookingConfig.ownerAvatar}
          maxDaysAhead={bookingConfig.rules.maxDaysAhead}
          eventType={booking.type}
          start={booking.start}
          end={booking.end}
          guestName={booking.guestName}
          meetLink={booking.meetLink}
          isPast={Date.parse(booking.start) < Date.now()}
        />
      )}
    </div>
  );
}
