// Minimal Google Calendar client using fetch and an OAuth refresh token.
// Google Calendar is the system of record: bookings are events tagged with a
// private extended property, and blocked days are tagged all-day events.

const API = "https://www.googleapis.com/calendar/v3";
const CALENDAR = "primary";

let cached: { token: string; expires: number } | null = null;

async function accessToken() {
  if (cached && cached.expires > Date.now() + 60_000) return cached.token;
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) {
    throw new Error("Google Calendar env vars are not set (see .env.example)");
  }
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Google token refresh failed: ${json.error ?? res.status}`);
  cached = { token: json.access_token, expires: Date.now() + json.expires_in * 1000 };
  return cached.token;
}

export class GoogleError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function gfetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
  if (res.status === 204) return undefined as T;
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new GoogleError(res.status, json?.error?.message ?? `Google API ${res.status}`);
  return json as T;
}

export type Interval = { start: number; end: number };

export type CalEvent = {
  id: string;
  status: string;
  summary?: string;
  description?: string;
  hangoutLink?: string;
  htmlLink?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  attendees?: { email: string; displayName?: string; responseStatus?: string }[];
  extendedProperties?: { private?: Record<string, string> };
};

export async function getBusy(calendars: string[], from: Date, to: Date): Promise<Interval[]> {
  const res = await gfetch<{ calendars: Record<string, { busy: { start: string; end: string }[] }> }>(
    "/freeBusy",
    {
      method: "POST",
      body: JSON.stringify({
        timeMin: from.toISOString(),
        timeMax: to.toISOString(),
        timeZone: "UTC",
        items: calendars.map((id) => ({ id })),
      }),
    },
  );
  return Object.values(res.calendars).flatMap((c) =>
    (c.busy ?? []).map((b) => ({ start: Date.parse(b.start), end: Date.parse(b.end) })),
  );
}

export async function listTagged(tag: "booking", from: Date, to: Date): Promise<CalEvent[]> {
  const items: CalEvent[] = [];
  let pageToken: string | undefined;
  do {
    const qs = new URLSearchParams({
      privateExtendedProperty: `${tag}=1`,
      timeMin: from.toISOString(),
      timeMax: to.toISOString(),
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "250",
    });
    if (pageToken) qs.set("pageToken", pageToken);
    const res = await gfetch<{ items: CalEvent[]; nextPageToken?: string }>(
      `/calendars/${CALENDAR}/events?${qs}`,
    );
    items.push(...res.items.filter((e) => e.status !== "cancelled"));
    pageToken = res.nextPageToken;
  } while (pageToken);
  return items;
}

export function getEvent(id: string) {
  return gfetch<CalEvent>(`/calendars/${CALENDAR}/events/${encodeURIComponent(id)}`);
}

export function createEvent(body: Record<string, unknown>) {
  return gfetch<CalEvent>(`/calendars/${CALENDAR}/events?conferenceDataVersion=1&sendUpdates=all`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function patchEvent(id: string, body: Record<string, unknown>, notify = true) {
  return gfetch<CalEvent>(
    `/calendars/${CALENDAR}/events/${encodeURIComponent(id)}?sendUpdates=${notify ? "all" : "none"}`,
    { method: "PATCH", body: JSON.stringify(body) },
  );
}

export function deleteEvent(id: string, notify = true) {
  return gfetch<void>(
    `/calendars/${CALENDAR}/events/${encodeURIComponent(id)}?sendUpdates=${notify ? "all" : "none"}`,
    { method: "DELETE" },
  );
}
