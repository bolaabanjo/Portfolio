// Personal scheduler configuration. Edit this file to change availability,
// event types and booking rules.

import { person } from "@/resources";

export type Question = {
  id: string;
  label: string;
  type: "text" | "textarea";
  required?: boolean;
  placeholder?: string;
};

export type EventType = {
  slug: string;
  title: string;
  duration: number; // minutes
  description: string;
  questions?: Question[];
};

/** "HH:MM" in the owner's timezone. */
export type Window = { start: string; end: string };

/** 0 = Sunday ... 6 = Saturday */
export type WeeklyHours = Record<0 | 1 | 2 | 3 | 4 | 5 | 6, Window[]>;

const weeklyHours: WeeklyHours = {
  0: [],
  1: [{ start: "10:00", end: "17:00" }],
  2: [{ start: "10:00", end: "17:00" }],
  3: [{ start: "10:00", end: "17:00" }],
  4: [{ start: "10:00", end: "17:00" }],
  5: [{ start: "10:00", end: "15:00" }],
  6: [],
};

const eventTypes: EventType[] = [
  {
    slug: "chat",
    title: "30-min call",
    duration: 30,
    description: "Talk through an idea, a project or a collaboration.",
    questions: [
      { id: "topic", label: "What would you like to talk about?", type: "textarea", required: true },
      { id: "company", label: "Company or project (optional)", type: "text" },
    ],
  },
];

/** The event type /book shows. */
export const defaultEventType = eventTypes[0];

export const bookingConfig = {
  ownerName: person.name,
  ownerEmail: person.email,
  ownerAvatar: "/images/book-avatar.jpg",
  timezone: person.location, // IANA, e.g. "Africa/Lagos"
  weeklyHours,
  /** Google calendars checked for conflicts. Bookings are written to "primary". */
  busyCalendars: ["primary"],
  rules: {
    slotInterval: 30, // minutes between candidate start times
    bufferBefore: 10, // minutes kept free before a meeting
    bufferAfter: 10, // minutes kept free after a meeting
    minNoticeHours: 12, // can't book sooner than this
    maxDaysAhead: 45, // can't book further out than this
    maxPerDay: 4, // cap on bookings per day (owner's timezone)
  },
  eventTypes,
};

export function getEventType(slug: string): EventType | undefined {
  return eventTypes.find((t) => t.slug === slug);
}
