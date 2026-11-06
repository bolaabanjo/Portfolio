import { NextRequest, NextResponse } from "next/server";
import { BookingError, cancelBooking, rescheduleBooking } from "@/lib/booking/bookings";
import { errorResponse, originOf } from "@/lib/booking/http";
import { readManageToken } from "@/lib/booking/tokens";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { t, action, start, reason } = await req.json();
    const id = readManageToken(t);
    if (!id) throw new BookingError(403, "This link is invalid");

    if (action === "cancel") {
      await cancelBooking(id, "guest", reason);
      return NextResponse.json({ ok: true });
    }
    if (action === "reschedule") {
      const b = await rescheduleBooking(id, String(start), originOf(req));
      return NextResponse.json({ start: b.start, end: b.end, meetLink: b.meetLink, manageUrl: b.manageUrl });
    }
    throw new BookingError(400, "Unknown action");
  } catch (err) {
    return errorResponse(err);
  }
}
