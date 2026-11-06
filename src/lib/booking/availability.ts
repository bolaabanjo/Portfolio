// Editable availability (timezone, weekly hours, date overrides).
//
// Stored as JSON in the description of a single hidden, non-blocking all-day
// event on the owner's Google Calendar, so there is still no database. Falls
// back to the defaults in config.ts until the first save.

import { bookingConfig, type WeeklyHours, type Window } from "./config";
import { createEvent, getEvent, GoogleError, patchEvent } from "./google";
import { isValidTimeZone } from "./time";

export type Override = { date: string; windows: Window[] }; // empty windows = unavailable all day

export type Availability = {
  timezone: string;
  weeklyHours: WeeklyHours;
  overrides: Override[];
};

// Custom Google event ids must use base32hex characters (0-9, a-v).
const SETTINGS_EVENT_ID = "bksettings01";
const CACHE_MS = 30_000;

let cache: { value: Availability; at: number } | null = null;

export function defaultAvailability(): Availability {
  return {
    timezone: bookingConfig.timezone,
    weeklyHours: structuredClone(bookingConfig.weeklyHours),
    overrides: [],
  };
}

// ---- Validation -------------------------------------------------------------

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$|^24:00$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export class AvailabilityError extends Error {}

function cleanWindows(input: unknown, label: string): Window[] {
  if (!Array.isArray(input)) throw new AvailabilityError(`${label}: invalid hours`);
  if (input.length > 8) throw new AvailabilityError(`${label}: too many time ranges`);
  const windows = input.map((w) => {
    const start = String(w?.start ?? "");
    const end = String(w?.end ?? "");
    if (!TIME_RE.test(start) || !TIME_RE.test(end)) throw new AvailabilityError(`${label}: invalid time`);
    if (start >= end) throw new AvailabilityError(`${label}: end time must be after start time`);
    return { start, end };
  });
  windows.sort((a, b) => a.start.localeCompare(b.start));
  for (let i = 1; i < windows.length; i++) {
    if (windows[i].start < windows[i - 1].end) throw new AvailabilityError(`${label}: time ranges overlap`);
  }
  return windows;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function validateAvailability(input: unknown): Availability {
  const a = (input ?? {}) as Partial<Availability>;
  const timezone = String(a.timezone ?? "");
  if (!isValidTimeZone(timezone)) throw new AvailabilityError("Invalid timezone");

  const weeklyHours = {} as WeeklyHours;
  for (let d = 0 as 0 | 1 | 2 | 3 | 4 | 5 | 6; d <= 6; d++) {
    weeklyHours[d] = cleanWindows(a.weeklyHours?.[d] ?? [], DAY_NAMES[d]);
  }

  if (!Array.isArray(a.overrides ?? [])) throw new AvailabilityError("Invalid overrides");
  const seen = new Set<string>();
  const overrides = (a.overrides ?? [])
    .map((o) => {
      const date = String(o?.date ?? "");
      if (!DATE_RE.test(date) || Number.isNaN(Date.parse(date))) throw new AvailabilityError("Invalid override date");
      if (seen.has(date)) throw new AvailabilityError(`Duplicate override for ${date}`);
      seen.add(date);
      return { date, windows: cleanWindows(o.windows ?? [], date) };
    })
    .sort((x, y) => x.date.localeCompare(y.date));
  if (overrides.length > 366) throw new AvailabilityError("Too many overrides");

  return { timezone, weeklyHours, overrides };
}

// ---- Storage ----------------------------------------------------------------

export async function getAvailability({ fresh = false } = {}): Promise<Availability> {
  if (!fresh && cache && Date.now() - cache.at < CACHE_MS) return cache.value;
  let value = defaultAvailability();
  try {
    const event = await getEvent(SETTINGS_EVENT_ID);
    if (event.status !== "cancelled" && event.description) {
      value = validateAvailability(JSON.parse(event.description));
    }
  } catch (err) {
    // Not saved yet (404/410) or unreadable: use defaults. Anything else is a real failure.
    if (!(err instanceof GoogleError && (err.status === 404 || err.status === 410)) && !(err instanceof SyntaxError) && !(err instanceof AvailabilityError)) {
      throw err;
    }
  }
  cache = { value, at: Date.now() };
  return value;
}

export async function saveAvailability(input: unknown): Promise<Availability> {
  const value = validateAvailability(input);
  const body = {
    summary: "Scheduler settings (do not delete)",
    description: JSON.stringify(value),
    start: { date: "2000-01-01" },
    end: { date: "2000-01-02" },
    transparency: "transparent", // never counts as busy
    visibility: "private",
    status: "confirmed", // also revives the event if it was deleted in Calendar
    extendedProperties: { private: { settings: "1" } },
  };
  try {
    await patchEvent(SETTINGS_EVENT_ID, body, false);
  } catch (err) {
    if (err instanceof GoogleError && err.status === 404) {
      await createEvent({ id: SETTINGS_EVENT_ID, ...body });
    } else {
      throw err;
    }
  }
  cache = { value, at: Date.now() };
  return value;
}

/** Windows that apply on a given owner-local date: an override if present, else the weekday's hours. */
export function windowsFor(a: Availability, date: string, weekday: 0 | 1 | 2 | 3 | 4 | 5 | 6): Window[] {
  const o = a.overrides.find((x) => x.date === date);
  return o ? o.windows : a.weeklyHours[weekday];
}
