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

      <Column fillWidth gap="l" paddingX="l">
        <RevealFx translateY="4">
          <Heading as="h1" variant="display-strong-l">
            {person.name}
          </Heading>
        </RevealFx>

        <RevealFx translateY="8" delay={0.1}>
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
                    mechanical engineering, software, and AI — and I&apos;m genuinely interested in
                    all three.
                  </p>
                  <p style={pStyle}>
                    I&apos;m the CEO of{" "}
                    <a href="https://cencori.com" style={linkStyle}>
                      Cencori
                    </a>
                    , an AI infrastructure company. We sit between your application and your AI
                    models, handling the hard parts so you can focus on building. Before Cencori, I
                    spent time working on aircraft systems and marine vessels — hands-on engineering
                    that taught me how complex systems actually behave under pressure.
                  </p>
                  <p style={pStyle}>
                    I also designed the QuanTonic Reactor, a quantum thermal-to-electric energy
                    system exploring an alternative to conventional solar technology. It&apos;s a
                    long-term bet on energy abundance — the kind of problem I think about even when
                    I&apos;m not actively working on it.
                  </p>
                  <p style={pStyle}>
                    I studied Mechanical Engineering and Computer
                    Science through MIT OCW. The combination gave me a way of thinking that moves
                    between hardware and software without friction.
                  </p>
                  <p style={pStyle}>
                    Most of my time goes into AI, energy, robotics, and design — not as separate
                    interests, but as different angles on the same question: how do you build things
                    that actually last? I care about systems that are intelligent, well-designed, and
                    built to hold up. That&apos;s the thread through everything I do.
                  </p>
                </>
              );
            })()}
            <div style={{ clear: "both" }} />
          </div>
        </RevealFx>
      </Column>
    </Column>
  );
}
