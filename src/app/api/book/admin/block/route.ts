import { NextRequest, NextResponse } from "next/server";
import { BookingError } from "@/lib/booking/bookings";
import { createEvent, deleteEvent, getEvent } from "@/lib/booking/google";
import { errorResponse, isAdmin, unauthorized } from "@/lib/booking/http";
import { addDays } from "@/lib/booking/time";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Block one or more whole days (inclusive) by creating an all-day busy event. */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  try {
    const { from, to, note } = await req.json();
    const end = to || from;
    if (!DATE_RE.test(from) || !DATE_RE.test(end) || end < from) {
      throw new BookingError(400, "Pick a valid date range");
    }
    await createEvent({
      summary: `Unavailable${note ? `: ${String(note).slice(0, 100)}` : ""}`,
      start: { date: from },
      end: { date: addDays(end, 1) }, // all-day end date is exclusive
      transparency: "opaque",
      extendedProperties: { private: { block: "1" } },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  try {
    const id = req.nextUrl.searchParams.get("id") ?? "";
    const event = await getEvent(id);
    if (event.extendedProperties?.private?.block !== "1") throw new BookingError(400, "Not a block");
    await deleteEvent(id, false);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
