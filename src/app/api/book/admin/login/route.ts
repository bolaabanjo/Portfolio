import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_TTL_MS, adminSession, safeEqual } from "@/lib/booking/tokens";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({}));
  const expected = process.env.BOOKING_ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: "BOOKING_ADMIN_PASSWORD is not set" }, { status: 500 });
  }
  if (typeof password !== "string" || !safeEqual(password, expected)) {
    await new Promise((r) => setTimeout(r, 500)); // slow down guessing
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_TTL_MS / 1000,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
