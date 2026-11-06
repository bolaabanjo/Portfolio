import { NextRequest, NextResponse } from "next/server";
import { BookingError } from "./bookings";

export function errorResponse(err: unknown) {
  if (err instanceof BookingError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error("[booking]", err);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

export const originOf = (req: NextRequest) => req.nextUrl.origin;
