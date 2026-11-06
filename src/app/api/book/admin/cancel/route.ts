import { NextRequest, NextResponse } from "next/server";
import { cancelBooking } from "@/lib/booking/bookings";
import { errorResponse, isAdmin, unauthorized } from "@/lib/booking/http";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  try {
    const { id, reason } = await req.json();
    await cancelBooking(String(id), "owner", reason);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
