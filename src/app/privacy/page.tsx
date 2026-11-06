import { Column, Heading, Text } from "@once-ui-system/core";
import type { Metadata } from "next";
import { baseURL, person } from "@/resources";

export const metadata: Metadata = {
  title: `Privacy – ${person.name}`,
  description: `How ${person.name}'s website and scheduler handle your information.`,
  openGraph: { url: `${baseURL}/privacy` },
};

const sections: [string, string][] = [
  [
    "Booking a call",
    "When you book a call at /chat, I collect your name, email address, timezone and your answers to the booking questions. This is used only to schedule and run the meeting.",
  ],
  [
    "Where it's stored",
    "Bookings are stored as events in my own Google Calendar, which also sends you the calendar invite and Google Meet link. Confirmation emails are sent through Sendbyte. Nothing is sold or shared with anyone else.",
  ],
  [
    "Google data",
    "The scheduler uses the Google Calendar API only on my own calendar, to check when I'm free and to create, move or cancel the meetings you book. It does not access any visitor's Google account.",
  ],
  [
    "Analytics",
    "This site uses Vercel Analytics for anonymous, aggregate page-view statistics. No cookies are used for tracking.",
  ],
  [
    "Your choices",
    `You can cancel a booking any time from the link in your confirmation email. To have your booking details deleted, email ${person.email}.`,
  ],
];

export default function Privacy() {
  return (
    <Column fillWidth style={{ maxWidth: 780 }} gap="l" paddingY="12" paddingX="l">
      <Column gap="8">
        <Heading as="h1" variant="display-strong-xs">
          Privacy
        </Heading>
        <Text onBackground="neutral-weak">Last updated November 5, 2026</Text>
      </Column>
      {sections.map(([title, body]) => (
        <Column key={title} gap="8">
          <Text variant="heading-strong-m">{title}</Text>
          <Text onBackground="neutral-weak">{body}</Text>
        </Column>
      ))}
    </Column>
  );
}
