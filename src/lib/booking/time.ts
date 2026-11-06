// Dependency-free timezone helpers. Safe to use on the server and in the browser.

const dtfCache = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(tz: string) {
  let f = dtfCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      weekday: "short",
    });
    dtfCache.set(tz, f);
  }
  return f;
}

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export function zonedParts(date: Date, tz: string) {
  const parts: Record<string, string> = {};
  for (const p of partsFormatter(tz).formatToParts(date)) parts[p.type] = p.value;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
    weekday: WEEKDAYS[parts.weekday] as 0 | 1 | 2 | 3 | 4 | 5 | 6,
  };
}

/** Offset of tz from UTC at the given instant, in milliseconds. */
function tzOffset(date: Date, tz: string) {
  const p = zonedParts(date, tz);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** Convert a wall-clock time in tz ("2026-11-05", "10:30") to a UTC Date. */
export function zonedToUtc(dateStr: string, time: string, tz: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let result = guess - tzOffset(new Date(guess), tz);
  // Re-check once in case the guess landed on the other side of a DST change.
  const second = guess - tzOffset(new Date(result), tz);
  if (second !== result) result = second;
  return new Date(result);
}

/** "YYYY-MM-DD" for the instant as seen in tz. */
export function dateKey(date: Date, tz: string) {
  const p = zonedParts(date, tz);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** Add whole days to a "YYYY-MM-DD" string. */
export function addDays(dateStr: string, n: number) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

/** Day of week (0 = Sunday) for a "YYYY-MM-DD" string. */
export function weekdayOf(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

export function formatInTz(date: Date | string, tz: string, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, ...opts }).format(new Date(date));
}

export function formatRange(start: string, end: string, tz: string) {
  const day = formatInTz(start, tz, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const t = (d: string) => formatInTz(d, tz, { hour: "numeric", minute: "2-digit" });
  return `${day}, ${t(start)} – ${t(end)}`;
}

export function isValidTimeZone(tz: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
