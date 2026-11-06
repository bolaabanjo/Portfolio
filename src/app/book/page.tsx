import { Column, Heading, Row, Text, RevealFx } from "@once-ui-system/core";
import Link from "next/link";
import type { Metadata } from "next";
import { baseURL, person } from "@/resources";
import { bookingConfig } from "@/lib/booking/config";
import styles from "@/components/book/Booking.module.scss";

export const metadata: Metadata = {
  title: `Book a call – ${person.name}`,
  description: `Pick a time to talk with ${person.name}.`,
  openGraph: { url: `${baseURL}/book` },
};

export default function BookIndex() {
  return (
    <Column fillWidth style={{ maxWidth: 780 }} gap="l" paddingY="12" horizontal="center">
      <RevealFx translateY="12" delay={0.2}>
        <Column fillWidth gap="8" paddingX="l">
          <Heading as="h1" variant="display-strong-xs">
            Book a call
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            Pick a meeting length, then choose a time that works for you.
          </Text>
        </Column>
      </RevealFx>

      <RevealFx translateY="16" delay={0.4}>
        <Column fillWidth gap="12" paddingX="l">
          {bookingConfig.eventTypes.map((t) => (
            <Link key={t.slug} href={`/book/${t.slug}`} style={{ textDecoration: "none" }}>
              <Column className={styles.panel} padding="l" gap="4" fillWidth>
                <Row horizontal="between" vertical="center">
                  <Text variant="heading-strong-m">{t.title}</Text>
                  <Text variant="label-default-s" onBackground="neutral-weak">
                    {t.duration} min →
                  </Text>
                </Row>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {t.description}
                </Text>
              </Column>
            </Link>
          ))}
        </Column>
      </RevealFx>
    </Column>
  );
}
