import { Column, Heading, Text, RevealFx } from "@once-ui-system/core";
import { music, baseURL } from "@/resources";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: music.title,
    description: music.description,
    openGraph: {
      title: music.title,
      description: music.description,
      url: `${baseURL}${music.path}`,
    },
  };
}

import { NowPlaying } from "@/components/spotify/NowPlaying";
import { SpotifyEmbed } from "@/components/spotify/SpotifyEmbed";

export default function Music() {
  return (
    <Column fillWidth style={{ maxWidth: 780 }} gap="l" paddingY="12" horizontal="center">
      <RevealFx translateY="12" delay={0.2}>
        <Column fillWidth gap="8" paddingX="l">
          <Heading as="h1" variant="display-strong-xs">
            {music.label}
          </Heading>
          <Text variant="body-default-m" onBackground="neutral-weak">
            {music.description}
          </Text>
        </Column>
      </RevealFx>

      <RevealFx translateY="16" delay={0.4}>
        <Column gap="32" fillWidth paddingX="l">
          <Column gap="16">
            <Text variant="heading-strong-m">Current listens</Text>
            <NowPlaying />
          </Column>

          <Column gap="16">
            <Text variant="heading-strong-m">Playlists</Text>
            <SpotifyEmbed 
              type="playlist" 
              url="https://open.spotify.com/playlist/4NnkR13g2QIGHpj8my2q4b?si=a98f64f3c49f49af" 
              height={352} 
            />
          </Column>
        </Column>
      </RevealFx>
    </Column>
  );
}
