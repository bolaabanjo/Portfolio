import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/lib/booking/bookings";
import { errorResponse, originOf } from "@/lib/booking/http";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Honeypot field: real users never fill it in.
    if (body.website) return NextResponse.json({ error: "Rejected" }, { status: 400 });
    const booking = await createBooking(body, originOf(req));
    return NextResponse.json({
      start: booking.start,
      end: booking.end,
      meetLink: booking.meetLink,
      manageUrl: booking.manageUrl,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
