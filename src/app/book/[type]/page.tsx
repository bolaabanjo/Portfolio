import { Column, Heading, Text, RevealFx } from "@once-ui-system/core";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { person } from "@/resources";
import { bookingConfig, getEventType } from "@/lib/booking/config";
import { BookingFlow } from "@/components/book/BookingFlow";

type Params = { params: Promise<{ type: string }> };

export function generateStaticParams() {
  return bookingConfig.eventTypes.map((t) => ({ type: t.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const t = getEventType((await params).type);
  return { title: t ? `${t.title} – ${person.name}` : "Book a call" };
}

export default async function BookType({ params }: Params) {
  const type = getEventType((await params).type);
  if (!type) notFound();

  return (
    <Column fillWidth style={{ maxWidth: 900 }} gap="l" paddingY="12" paddingX="l">
      <RevealFx translateY="12" delay={0.2}>
        <Column fillWidth gap="8">
          <Link href="/book">
            <Text variant="label-default-s" onBackground="neutral-weak">
              ← All meeting types
            </Text>
          </Link>
          <Heading as="h1" variant="display-strong-xs">
            {type.title}
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
