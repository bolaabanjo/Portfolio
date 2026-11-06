import { NextRequest, NextResponse } from "next/server";
import { BookingError, loadBooking } from "@/lib/booking/bookings";
import { getEventType } from "@/lib/booking/config";
import { errorResponse } from "@/lib/booking/http";
import { getAvailableSlots } from "@/lib/booking/slots";
import { readManageToken } from "@/lib/booking/tokens";

export const dynamic = "force-dynamic";

const MAX_RANGE_MS = 42 * 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams;
    const from = new Date(q.get("from") ?? "");
    const to = new Date(q.get("to") ?? "");
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) {
      throw new BookingError(400, "Invalid range");
    }
    if (to.getTime() - from.getTime() > MAX_RANGE_MS) throw new BookingError(400, "Range too large");

    // Rescheduling: use the booking's own type and ignore its current slot.
    const token = q.get("t");
    if (token) {
      const id = readManageToken(token);
      const booking = id ? await loadBooking(id) : null;
      if (!booking) throw new BookingError(404, "Booking not found");
      const slots = await getAvailableSlots(booking.type, from, to, {
        ignore: { start: Date.parse(booking.start), end: Date.parse(booking.end) },
      });
      return NextResponse.json({ slots });
    }

    const type = getEventType(q.get("type") ?? "");
    if (!type) throw new BookingError(400, "Unknown event type");
    return NextResponse.json({ slots: await getAvailableSlots(type, from, to) });
  } catch (err) {
    return errorResponse(err);
  }
}
