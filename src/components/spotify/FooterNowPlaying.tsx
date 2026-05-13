"use client";

import { useEffect, useState } from "react";
import { Text, Row, SmartLink } from "@once-ui-system/core";

type NowPlayingData = {
  albumImageUrl: string;
  artist: string;
  isPlaying: boolean;
  songUrl: string;
  title: string;
  tempo?: number;
};

export const FooterNowPlaying = () => {
  const [data, setData] = useState<NowPlayingData | null>(null);

  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const response = await fetch("/api/spotify/now-playing");
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch now playing data", error);
      }
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!data || !data.title) return null;

  return (
    <SmartLink href={data.songUrl} style={{ textDecoration: "none", textAlign: "center" }}>
      <Text variant="body-default-s">
        <Text onBackground="neutral-weak">
          {data.isPlaying ? "currently playing" : "last played"} —{" "}
        </Text>
        <Text onBackground="neutral-strong">
          {data.title}
        </Text>
        <Text onBackground="neutral-weak">
          {" "}by {data.artist}
        </Text>
      </Text>
    </SmartLink>
  );
};
