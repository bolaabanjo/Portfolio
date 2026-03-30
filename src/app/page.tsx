import {
  Heading,
  Button,
  Avatar,
  RevealFx,
  Column,
  Row,
  Schema,
  Meta,
} from "@once-ui-system/core";
import { home, about, person, baseURL } from "@/resources";
import Link from "next/link";

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

export default function Home() {
  return (
    <Column style={{ maxWidth: 680 }} gap="xl" paddingY="12" horizontal="center">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={`/api/og/generate?title=${encodeURIComponent(home.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />

      <RevealFx translateY="8" delay={0.2}>
      <Column fillWidth gap="l" paddingX="l">
          <Heading as="h1" variant="display-strong-l">
            {person.name}
          </Heading>

          <div>
            <img
              src="/images/gallery/IMG_1596 3.JPG"
              alt={person.name}
              style={{
                float: "right",
                width: 140,
                height: 140,
                borderRadius: "50%",
                marginLeft: 24,
                marginBottom: 16,
                objectFit: "cover",
              }}
            />
            {(() => {
              const linkStyle = {
                color: "var(--neutral-on-background-strong)",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              };
              const pStyle = {
                margin: 0,
                marginBottom: 16,
                lineHeight: 1.7,
                color: "var(--neutral-on-background-weak)",
                fontSize: "var(--font-size-body-default-m)",
              };
              return (
                <>
                  <p style={pStyle}>
                    I&apos;m an engineer from Lagos, Nigeria. My friends call me Roy. I work across
                    mechanical engineering, software, and AI — not as separate disciplines, but as
                    different ways of solving the same kinds of problems. I care about systems that
                    are intelligent, well-designed, and built to last (Means I care about me, in case
                    you missed it).
                  </p>
                  <p style={pStyle}>
                    I&apos;m the CEO of{" "}
                    <a href="https://cencori.com" style={linkStyle}>Cencori</a>, an AI
                    company — read more about it{" "}
                    <Link href="/work/cencori" style={linkStyle}>here</Link>. Before Cencori, I
                    spent time working on aircraft systems and marine vessels. See my other{" "}
                    <Link href="/work" style={linkStyle}>works</Link> too.
                  </p>
                  <p style={pStyle}>
                    I designed the QuanTonic Reactor, a quantum
                    thermal-to-electric system exploring an alternative to conventional solar technology.
                    I write about ideas like this in my{" "}
                    <Link href="/blog" style={linkStyle}>essays</Link>. Most of my time goes into AI, energy, robotics, and design — different angles on
                    the same question: how do you build things that actually hold up?
                  </p>
                  <p style={pStyle}>
                    I studied Mechanical Engineering and Computer Science through MIT OCW. The
                    combination gave me a way of thinking that moves between hardware and software
                    without friction. I keep track of what I&apos;m learning in my{" "}
                    <Link href="/library" style={linkStyle}>library</Link> — including the{" "}
                    <Link href="/library/books" style={linkStyle}>books</Link> that shaped how I think.
                  </p>
                  <p style={pStyle}>
                    If you&apos;re curious what I look like behind the work, check out my{" "}
                    <Link href="/gallery" style={linkStyle}>gallery</Link>.
                  </p>
                </>
              );
            })()}
            <div style={{ clear: "both" }} />
          </div>
      </Column>
      </RevealFx>
    </Column>
  );
}
