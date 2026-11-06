import { bookingConfig, type EventType } from "./config";
import { getBusy, listTagged, type Interval } from "./google";
import { addDays, dateKey, weekdayOf, zonedToUtc } from "./time";

const MIN = 60_000;

type Options = {
  /** Busy interval to ignore, e.g. the booking being rescheduled. */
  ignore?: Interval;
};

/** Earliest and latest instants a booking may start, given the rules. */
export function bookingWindow(now = Date.now()) {
  const { minNoticeHours, maxDaysAhead } = bookingConfig.rules;
  return {
    earliest: now + minNoticeHours * 60 * MIN,
    latest: now + maxDaysAhead * 24 * 60 * MIN,
  };
}

/** All available start times (ISO, UTC) for the event type within [from, to). */
export async function getAvailableSlots(
  type: EventType,
  from: Date,
  to: Date,
  opts: Options = {},
): Promise<string[]> {
  const { timezone, weeklyHours, busyCalendars, rules } = bookingConfig;
  const { earliest, latest } = bookingWindow();

  const start = Math.max(from.getTime(), earliest);
  const end = Math.min(to.getTime(), latest);
  if (start >= end) return [];

  // Pad the query so buffers at the edges and the per-day cap see whole days.
  const qFrom = new Date(start - 36 * 60 * MIN);
  const qTo = new Date(end + 36 * 60 * MIN);

  const [busyRaw, bookings] = await Promise.all([
    getBusy(busyCalendars, qFrom, qTo),
    listTagged("booking", qFrom, qTo),
  ]);

  const busy = opts.ignore
    ? busyRaw.filter((b) => !(b.start === opts.ignore!.start && b.end === opts.ignore!.end))
    : busyRaw;

  const perDay = new Map<string, number>();
  for (const b of bookings) {
    if (!b.start.dateTime) continue;
    const t = Date.parse(b.start.dateTime);
    if (opts.ignore && t === opts.ignore.start) continue;
    const k = dateKey(new Date(t), timezone);
    perDay.set(k, (perDay.get(k) ?? 0) + 1);
  }

  const slots: string[] = [];
  const duration = type.duration * MIN;
  const lastDay = dateKey(new Date(end), timezone);

  for (let day = dateKey(new Date(start), timezone); day <= lastDay; day = addDays(day, 1)) {
    if ((perDay.get(day) ?? 0) >= rules.maxPerDay) continue;

    for (const w of weeklyHours[weekdayOf(day)]) {
      const wStart = zonedToUtc(day, w.start, timezone).getTime();
      const wEnd = zonedToUtc(day, w.end, timezone).getTime();

      for (let t = wStart; t + duration <= wEnd; t += rules.slotInterval * MIN) {
        if (t < start || t >= end) continue;
        const s = t - rules.bufferBefore * MIN;
        const e = t + duration + rules.bufferAfter * MIN;
        if (busy.some((b) => s < b.end && e > b.start)) continue;
        slots.push(new Date(t).toISOString());
      }
    }
  }

  return slots;
}

/** Re-check a single start time right before writing, to avoid double booking. */
export async function isSlotAvailable(type: EventType, startIso: string, opts: Options = {}) {
  const t = Date.parse(startIso);
  if (Number.isNaN(t)) return false;
  const slots = await getAvailableSlots(type, new Date(t), new Date(t + 1), opts);
  return slots.includes(new Date(t).toISOString());
}
