import { Flex } from "@once-ui-system/core";
import type { Metadata } from "next";
import { baseURL, person } from "@/resources";
import { bookingConfig, defaultEventType } from "@/lib/booking/config";
import { BookingFlow } from "@/components/book/BookingFlow";

export const metadata: Metadata = {
  title: `Chat – ${person.name}`,
  description: `Pick a time for a ${defaultEventType.duration}-minute call with ${person.name}.`,
  openGraph: { url: `${baseURL}/chat` },
};

export default function Book() {
  return (
    <Flex fillWidth paddingX="l" paddingY="64" horizontal="center" style={{ minHeight: "70svh" }} vertical="center">
      <BookingFlow
        eventType={defaultEventType}
        ownerName={bookingConfig.ownerName}
        ownerAvatar={bookingConfig.ownerAvatar}
        maxDaysAhead={bookingConfig.rules.maxDaysAhead}
      />
    </Flex>
  );
}
