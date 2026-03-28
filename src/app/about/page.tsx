import {
  Avatar,
  Button,
  Column,
  Heading,
  Icon,
  IconButton,
  Line,
  Media,
  Tag,
  Text,
  Meta,
  Schema,
  Row,
} from "@once-ui-system/core";
import { baseURL, about, person, social } from "@/resources";
import TableOfContents from "@/components/about/TableOfContents";
import styles from "@/components/about/about.module.scss";
import React from "react";

export async function generateMetadata() {
  return Meta.generate({
    title: about.title,
    description: about.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(about.title)}`,
    path: about.path,
  });
}

export default function About() {
  const structure = [
    {
      title: about.intro.title,
      display: about.intro.display,
      items: [],
    },
    {
      title: about.work.title,
      display: about.work.display,
      items: about.work.experiences.map((experience) => experience.company),
    },
    {
      title: about.studies.title,
      display: about.studies.display,
      items: about.studies.institutions.map((institution) => institution.name),
    },
    {
      title: about.technical.title,
      display: about.technical.display,
      items: about.technical.skills.map((skill) => skill.title),
    },
  ];
  return (
    <Column maxWidth="m">
      <Schema
        as="webPage"
        baseURL={baseURL}
        title={about.title}
        description={about.description}
        path={about.path}
        image={`/api/og/generate?title=${encodeURIComponent(about.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      {about.tableOfContent.display && (
        <Column
          left="0"
          style={{ top: "50%", transform: "translateY(-50%)" }}
          position="fixed"
          paddingLeft="24"
          gap="32"
          s={{ hide: true }}
        >
          <TableOfContents structure={structure} about={about} />
        </Column>
      )}
      <Row fillWidth s={{ direction: "column"}} horizontal="center">
        {about.avatar.display && (
          <Column
            className={styles.avatar}
            top="64"
            fitHeight
            position="sticky"
            s={{ position: "relative", style: { top: "auto" } }}
            xs={{ style: { top: "auto" } }}
            minWidth="160"
            paddingX="l"
            paddingBottom="xl"
            gap="m"
            flex={3}
            horizontal="center"
          >
            <Avatar src={person.avatar} size="xl" />
            <Row gap="8" vertical="center">
              <Icon onBackground="accent-weak" name="globe" />
              {person.location}
            </Row>
            {person.languages && person.languages.length > 0 && (
              <Row wrap gap="8">
                {person.languages.map((language, index) => (
                  <Tag key={index} size="l">
                    {language}
                  </Tag>
                ))}
              </Row>
            )}
          </Column>
        )}
        <Column className={styles.blockAlign} flex={9} maxWidth={40}>
          <Column
            id={about.intro.title}
            fillWidth
            minHeight="160"
            vertical="center"
            marginBottom="32"
          >
            {about.calendar.display && (
              <Row
                fitWidth
                border="brand-alpha-medium"
                background="brand-alpha-weak"
                radius="full"
                padding="4"
                gap="8"
                marginBottom="m"
                vertical="center"
                className={styles.blockAlign}
                style={{
                  backdropFilter: "blur(var(--static-space-1))",
                }}
              >
                <Icon paddingLeft="12" name="calendar" onBackground="brand-weak" />
                <Row paddingX="8">Schedule a call</Row>
                <IconButton
                  href={about.calendar.link}
                  data-border="rounded"
                  variant="secondary"
                  icon="chevronRight"
                />
              </Row>
            )}
            <Heading className={styles.textAlign} variant="display-strong-m">
              {person.name}
            </Heading>
            <Text
              className={styles.textAlign}
              variant="body-default-l"
              onBackground="neutral-weak"
            >
              {person.role}
            </Text>
            {social.length > 0 && (
              <Row
                className={styles.blockAlign}
                paddingTop="20"
                paddingBottom="8"
                gap="8"
                wrap
                horizontal="center"
                fitWidth
                data-border="rounded"
              >
                {social.map(
                  (item) =>
                    item.link && (
                      <React.Fragment key={item.name}>
                        <Row s={{ hide: true }}>
                          <Button
                            key={item.name}
                            href={item.link}
                            prefixIcon={item.icon}
                            label={item.name}
                            size="s"
                            weight="default"
                            variant="secondary"
                          />
                        </Row>
                        <Row hide s={{ hide: false }}>
                          <IconButton
                            size="l"
                            key={`${item.name}-icon`}
                            href={item.link}
                            icon={item.icon}
                            variant="secondary"
                          />
                        </Row>
                      </React.Fragment>
                    ),
                )}
              </Row>
            )}
          </Column>

          {about.intro.display && (
            <Column
              fillWidth
              gap="m"
              marginBottom="xl"
              style={{
                color: "var(--neutral-on-background-weak)",
                fontSize: "var(--font-size-body-default-m)",
                lineHeight: 1.75,
              }}
            >
              <style>{`
                .about-intro p { margin: 0 0 8px 0; }
                .about-intro strong {
                  color: var(--neutral-on-background-strong);
                  font-weight: 500;
                }
                .about-intro a {
                  color: var(--neutral-on-background-strong);
                  text-decoration: underline;
                  text-underline-offset: 3px;
                }
              `}</style>
              <div className="about-intro">
                {about.intro.description}
              </div>
            </Column>
          )}

          {about.work.display && (
            <>
              <Line fillWidth background="neutral-alpha-medium" marginBottom="l" marginTop="m" />
              <Heading as="h2" id={about.work.title} variant="heading-strong-l" marginBottom="m">
                {about.work.title}
              </Heading>
              <Column fillWidth gap="l" marginBottom="40">
                {about.work.experiences.map((experience, index) => (
                  <Column key={`${experience.company}-${experience.role}-${index}`} fillWidth gap="4">
                    <Row fillWidth horizontal="between" vertical="center">
                      <Text id={experience.company} variant="heading-strong-m" onBackground="neutral-strong">
                        {experience.company}
                      </Text>
                      <Text variant="body-default-s" onBackground="neutral-weak">
                        {experience.timeframe}
                      </Text>
                    </Row>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {experience.role}
                    </Text>
                    <Column gap="4" paddingTop="8">
                      {experience.achievements.map(
                        (achievement: React.ReactNode, index: number) => (
                          <Row key={`${experience.company}-${index}`} gap="8">
                            <Text variant="body-default-s" onBackground="neutral-weak" style={{ flexShrink: 0 }}>
                              –
                            </Text>
                            <Text
                              variant="body-default-s"
                              onBackground="neutral-weak"
                            >
                              {achievement}
                            </Text>
                          </Row>
                        ),
                      )}
                    </Column>
                  </Column>
                ))}
              </Column>
            </>
          )}

          {about.studies.display && (
            <>
              <Line fillWidth background="neutral-alpha-medium" marginBottom="l" marginTop="m" />
              <Heading as="h2" id={about.studies.title} variant="heading-strong-l" marginBottom="m">
                {about.studies.title}
              </Heading>
              <Column fillWidth gap="l" marginBottom="40">
                {about.studies.institutions.map((institution, index) => (
                  <Column key={`${institution.name}-${index}`} fillWidth gap="4">
                    <Text id={institution.name} variant="heading-strong-m" onBackground="neutral-strong">
                      {institution.name}
                    </Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {institution.description}
                    </Text>
                  </Column>
                ))}
              </Column>
            </>
          )}

          {about.technical.display && (
            <>
              <Line fillWidth background="neutral-alpha-medium" marginBottom="l" marginTop="m" />
              <Heading
                as="h2"
                id={about.technical.title}
                variant="heading-strong-l"
                marginBottom="m"
              >
                {about.technical.title}
              </Heading>
              <Column fillWidth gap="l" marginBottom="40">
                {[
                  {
                    category: "Engineering",
                    items: "Mechanical Engineering, Aerospace, Marine Engineering, Robotics, Hardware & Prototyping, Energy Systems, 3D Design",
                  },
                  {
                    category: "Software & AI",
                    items: "Software Engineering, Next.js, Backend Architecture, AI Engineering, LLMs & Multi-modal AI, Prompt Engineering, Git & GitHub",
                  },
                  {
                    category: "Design",
                    items: "UI/UX Design, Product & System Design, Figma, Design Engineering",
                  },
                ].map((group) => (
                  <Column key={group.category} fillWidth gap="4">
                    <Text variant="heading-strong-m" onBackground="neutral-strong">
                      {group.category}
                    </Text>
                    <Text variant="body-default-s" onBackground="neutral-weak">
                      {group.items}
                    </Text>
                  </Column>
                ))}
              </Column>
            </>
          )}
        </Column>
      </Row>
    </Column>
  );
}