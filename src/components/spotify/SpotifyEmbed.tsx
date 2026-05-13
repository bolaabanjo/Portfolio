"use client";

import { Row, Column, Text } from "@once-ui-system/core";

interface SpotifyEmbedProps {
  url: string;
  type?: "playlist" | "show" | "episode" | "album" | "track";
  height?: number;
}

export const SpotifyEmbed = ({ url, type = "playlist", height = 352 }: SpotifyEmbedProps) => {
  // Extract ID from full URL (e.g., https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M)
  const idMatch = url.match(/\/([a-zA-Z0-9]+)(\?|$)/);
  const id = idMatch ? idMatch[1] : "";

  if (!id) {
    return (
      <Row padding="16" radius="l" border="neutral-alpha-weak" background="surface">
        <Text variant="body-default-s" onBackground="neutral-weak">Invalid Spotify URL</Text>
      </Row>
    );
  }

  const embedUrl = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;

  return (
    <div style={{ width: "100%", borderRadius: "var(--radius-l)", overflow: "hidden" }}>
      <iframe
        style={{ borderRadius: "var(--radius-l)", border: "none" }}
        src={embedUrl}
        width="100%"
        height={height}
        allowFullScreen={false}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      ></iframe>
    </div>
  );
};
