import { NextRequest, NextResponse } from "next/server";
import { BookingError } from "./bookings";
import { ADMIN_COOKIE, isAdminSession } from "./tokens";

export function errorResponse(err: unknown) {
  if (err instanceof BookingError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error("[booking]", err);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

export const originOf = (req: NextRequest) => req.nextUrl.origin;

export const isAdmin = (req: NextRequest) => isAdminSession(req.cookies.get(ADMIN_COOKIE)?.value);

export const unauthorized = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
