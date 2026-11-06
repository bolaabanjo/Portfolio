import { NextRequest, NextResponse } from "next/server";
import { AvailabilityError, getAvailability, saveAvailability } from "@/lib/booking/availability";
import { errorResponse, isAdmin, unauthorized } from "@/lib/booking/http";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  try {
    return NextResponse.json(await getAvailability({ fresh: true }));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) return unauthorized();
  try {
    return NextResponse.json(await saveAvailability(await req.json()));
  } catch (err) {
    if (err instanceof AvailabilityError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return errorResponse(err);
  }
}
