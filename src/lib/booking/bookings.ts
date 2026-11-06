import { randomBytes } from "node:crypto";
import { bookingConfig, getEventType, type EventType } from "./config";
import { sendBooked, sendCancelled } from "./email";
import { createEvent, deleteEvent, getEvent, GoogleError, patchEvent, type CalEvent } from "./google";
import { isSlotAvailable } from "./slots";
import { isValidTimeZone } from "./time";
import { manageToken } from "./tokens";

export class BookingError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export type Booking = {
  id: string;
  type: EventType;
  start: string;
  end: string;
  guestName: string;
  guestEmail: string;
  guestTz: string;
  meetLink?: string;
  description?: string;
};

export function baseUrl(origin: string) {
  return (process.env.BOOKING_BASE_URL || origin).replace(/\/$/, "");
}

export const manageUrl = (origin: string, id: string) =>
  `${baseUrl(origin)}/book/manage?t=${encodeURIComponent(manageToken(id))}`;

export function toBooking(e: CalEvent): Booking | null {
  const p = e.extendedProperties?.private;
  if (p?.booking !== "1" || e.status === "cancelled" || !e.start.dateTime || !e.end.dateTime) return null;
  const type = getEventType(p.type) ?? {
    slug: p.type,
    title: e.summary ?? "Meeting",
    duration: (Date.parse(e.end.dateTime) - Date.parse(e.start.dateTime)) / 60000,
    description: "",
  };
  return {
    id: e.id,
    type,
    start: new Date(e.start.dateTime).toISOString(),
    end: new Date(e.end.dateTime).toISOString(),
    guestName: p.guestName ?? "",
    guestEmail: p.guestEmail ?? "",
    guestTz: p.guestTz ?? bookingConfig.timezone,
    meetLink: e.hangoutLink,
    description: e.description,
  };
}

/** Load a booking by event id; null if missing, cancelled or not a booking. */
export async function loadBooking(id: string) {
  try {
    return toBooking(await getEvent(id));
  } catch (err) {
    if (err instanceof GoogleError && (err.status === 404 || err.status === 410)) return null;
    throw err;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type CreateInput = {
  type: string;
  start: string;
  name: string;
  email: string;
  timezone: string;
  answers?: Record<string, string>;
};

export async function createBooking(input: CreateInput, origin: string) {
  const type = getEventType(String(input.type));
  if (!type) throw new BookingError(400, "Unknown event type");

  const name = String(input.name ?? "").trim().slice(0, 100);
  const email = String(input.email ?? "").trim().toLowerCase().slice(0, 200);
  const tz = isValidTimeZone(String(input.timezone)) ? String(input.timezone) : bookingConfig.timezone;
  if (!name) throw new BookingError(400, "Name is required");
  if (!EMAIL_RE.test(email)) throw new BookingError(400, "A valid email is required");

  const answers = (type.questions ?? []).map((q) => {
    const value = String(input.answers?.[q.id] ?? "").trim().slice(0, 2000);
    if (q.required && !value) throw new BookingError(400, `"${q.label}" is required`);
    return { label: q.label, value };
  });

  const startMs = Date.parse(String(input.start));
  if (Number.isNaN(startMs)) throw new BookingError(400, "Invalid start time");
  const start = new Date(startMs).toISOString();
  const end = new Date(startMs + type.duration * 60000).toISOString();

  if (!(await isSlotAvailable(type, start))) {
    throw new BookingError(409, "That time was just taken. Please pick another.");
  }

  // Choose the event id up front so the manage link can go in the invite.
  const id = `bk${randomBytes(12).toString("hex")}`;
  const link = manageUrl(origin, id);
  const description = [
    ...answers.filter((a) => a.value).map((a) => `${a.label}\n${a.value}`),
    `Reschedule or cancel: ${link}`,
  ].join("\n\n");

  const event = await createEvent({
    id,
    summary: `${type.title}: ${name} & ${bookingConfig.ownerName}`,
    description,
    start: { dateTime: start, timeZone: bookingConfig.timezone },
    end: { dateTime: end, timeZone: bookingConfig.timezone },
    attendees: [{ email, displayName: name }],
    conferenceData: {
      createRequest: { requestId: id, conferenceSolutionKey: { type: "hangoutsMeet" } },
    },
    extendedProperties: {
      private: { booking: "1", type: type.slug, guestName: name, guestEmail: email, guestTz: tz },
    },
  });

  const booking = toBooking(event)!;
  await sendBooked(
    { title: type.title, start, end, guestName: name, guestEmail: email, guestTz: tz, meetLink: booking.meetLink, manageUrl: link, answers },
    "booked",
  );
  return { ...booking, manageUrl: link };
}

export async function rescheduleBooking(id: string, newStart: string, origin: string) {
  const current = await loadBooking(id);
  if (!current) throw new BookingError(404, "This booking no longer exists");

  const startMs = Date.parse(newStart);
  if (Number.isNaN(startMs)) throw new BookingError(400, "Invalid start time");
  const start = new Date(startMs).toISOString();
  const end = new Date(startMs + current.type.duration * 60000).toISOString();

  const ignore = { start: Date.parse(current.start), end: Date.parse(current.end) };
  if (!(await isSlotAvailable(current.type, start, { ignore }))) {
    throw new BookingError(409, "That time was just taken. Please pick another.");
  }

  const event = await patchEvent(id, {
    start: { dateTime: start, timeZone: bookingConfig.timezone },
    end: { dateTime: end, timeZone: bookingConfig.timezone },
  });
  const booking = toBooking(event)!;
  const link = manageUrl(origin, id);
  await sendBooked(
    { title: current.type.title, start, end, guestName: current.guestName, guestEmail: current.guestEmail, guestTz: current.guestTz, meetLink: booking.meetLink, manageUrl: link },
    "rescheduled",
  );
  return { ...booking, manageUrl: link };
}

export async function cancelBooking(id: string, by: "guest" | "owner", reason?: string) {
  const current = await loadBooking(id);
  if (!current) throw new BookingError(404, "This booking no longer exists");
  await deleteEvent(id);
  await sendCancelled(
    { title: current.type.title, start: current.start, end: current.end, guestName: current.guestName, guestEmail: current.guestEmail, guestTz: current.guestTz },
    by,
    reason?.trim().slice(0, 500) || undefined,
  );
}
