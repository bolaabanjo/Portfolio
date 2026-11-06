import { Column, Heading, Text, RevealFx } from "@once-ui-system/core";
import type { Metadata } from "next";
import { baseURL, person } from "@/resources";
import { bookingConfig, defaultEventType } from "@/lib/booking/config";
import { BookingFlow } from "@/components/book/BookingFlow";

export const metadata: Metadata = {
  title: `Book a call – ${person.name}`,
  description: `Pick a time for a ${defaultEventType.duration}-minute call with ${person.name}.`,
  openGraph: { url: `${baseURL}/book` },
};

export default function Book() {
  const type = defaultEventType;
  return (
    <Column fillWidth style={{ maxWidth: 900 }} gap="l" paddingY="12" paddingX="l">
      <RevealFx translateY="12" delay={0.2}>
        <Column fillWidth gap="8">
          <Heading as="h1" variant="display-strong-xs">
            Book a call
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            {type.description} · {type.duration} min · Google Meet
          </Text>
        </Column>
      </RevealFx>
      <BookingFlow
        eventType={type}
        ownerName={bookingConfig.ownerName}
        maxDaysAhead={bookingConfig.rules.maxDaysAhead}
      />
    </Column>
  );
}
