import { createHmac, timingSafeEqual } from "node:crypto";

function secret() {
  const s = process.env.BOOKING_SECRET;
  if (!s || s.length < 16) throw new Error("BOOKING_SECRET must be set (16+ chars)");
  return s;
}

function hmac(data: string) {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function sign(payload: Record<string, unknown>) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${hmac(body)}`;
}

export function verify<T = Record<string, unknown>>(token: string | undefined | null): T | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig || !safeEqual(sig, hmac(body))) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as T & { exp?: number };
    if (data.exp && data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

/** Token embedded in cancel/reschedule links. */
export const manageToken = (eventId: string) => sign({ k: "manage", e: eventId });

export function readManageToken(token: string | undefined | null) {
  const data = verify<{ k: string; e: string }>(token);
  return data?.k === "manage" ? data.e : null;
}

export const ADMIN_COOKIE = "book_admin";
export const ADMIN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const adminSession = () => sign({ k: "admin", exp: Date.now() + ADMIN_TTL_MS });

export function isAdminSession(token: string | undefined | null) {
  return verify<{ k: string }>(token)?.k === "admin";
}
