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
import localFont from "next/font/local";
import styles from "./Home.module.scss";

const highnessa = localFont({
  src: "../assets/fonts/HighnessaDemo.otf",
  display: "swap",
});

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
    <Column id="home-page" className={styles.home} style={{ maxWidth: 680 }} horizontal="center">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={home.image}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />

      <RevealFx
        translateY="8"
        delay={0.2}
        style={{ paddingTop: 24, marginTop: -24 }}
      >
      <Column fillWidth className={styles.content} paddingX="l">
          <Heading
            as="h1"
            variant="display-strong-l"
            className={styles.heading}
            style={{
              fontFamily: highnessa.style.fontFamily,
              fontWeight: 400,
              fontSize: "clamp(2.5rem, min(14vw, 11dvh), 5rem)",
              lineHeight: 1.1,
              letterSpacing: 0,
            }}
          >
            {person.name}
          </Heading>

          <div>
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
                  <div className={styles.desktopBio}>
                  <p style={pStyle} className="home-intro-text">
                    I&apos;m the CEO of{" "}
                    <a href="https://cencori.com" style={linkStyle}>Cencori</a>, an AI
                    infra company — read more about it{" "}
                    <Link href="/work/cencori" style={linkStyle}>here</Link>. Before Cencori, I
                    spent time working on aircraft systems and marine vessels. See my other{" "}
                    <Link href="/work" style={linkStyle}>works</Link> too.
                  </p>
                  <p style={pStyle} className="home-intro-text">
                    I designed the QuanTonic Reactor, a quantum
                    thermal-to-electric system exploring an alternative to conventional solar technology.
                    I write about ideas like this in my{" "}
                    <Link href="/essay" style={linkStyle}>essays</Link>. Most of my time goes into AI, energy, robotics, and design — different angles on
                    the same question: how do you build things that actually hold up?
                  </p>
                  <p style={pStyle} className="home-intro-text">
                    I studied Mechanical Engineering and Computer Science through MIT OCW. The
                    combination gave me a way of thinking that moves between hardware and software
                    without friction. I keep track of what I&apos;m learning in my{" "}
                    <Link href="/library" style={linkStyle}>library</Link> — including the{" "}
                    <Link href="/library/books" style={linkStyle}>books</Link> that shaped how I think.
                  </p>
                  <p style={pStyle} className="home-intro-text">
                    If you&apos;re curious what I look like behind the work, check out my{" "}
                    <Link href="/gallery" style={linkStyle}>gallery</Link>.
                  </p>
                  </div>
                  <div className={styles.mobileBio}>
                    <p>
                      Co-founder and CEO of <a href="https://cencori.com" style={linkStyle}>Cencori</a>,
                      building AI infrastructure across software and mechanical engineering.
                    </p>
                    <p>
                      I designed the QuanTonic Reactor. Explore my{" "}
                      <Link href="/work" style={linkStyle}>work</Link>,{" "}
                      <Link href="/essay" style={linkStyle}>essays</Link>,{" "}
                      <Link href="/library" style={linkStyle}>library</Link>, and{" "}
                      <Link href="/gallery" style={linkStyle}>gallery</Link>.
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
      </Column>
      </RevealFx>
    </Column>
  );
}
