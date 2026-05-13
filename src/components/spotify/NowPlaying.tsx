"use client";

import { useEffect, useState } from "react";
import { Row, Column, Text, Icon } from "@once-ui-system/core";
import Link from "next/link";

type NowPlayingData = {
  albumImageUrl: string;
  artist: string;
  isPlaying: boolean;
  songUrl: string;
  title: string;
  progressMs?: number;
  durationMs?: number;
  tempo?: number;
};

export const NowPlaying = () => {
  const [data, setData] = useState<NowPlayingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const response = await fetch("/api/spotify/now-playing");
        const json = await response.json();
        setData(json);
        if (json.progressMs) {
          setProgress(json.progressMs);
        }
      } catch (error) {
        console.error("Failed to fetch now playing data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNowPlaying();
    
    // Poll every 15 seconds to keep it relatively in sync
    const interval = setInterval(fetchNowPlaying, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!data?.isPlaying || !data?.durationMs) return;

    // Simulate progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + 1000 >= data.durationMs!) {
          // It finished the song before the next poll, just keep it at max
          return data.durationMs!;
        }
        return prev + 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [data?.isPlaying, data?.durationMs]);

  if (loading) {
    return (
      <Row vertical="center" gap="16" padding="16" radius="l" border="neutral-alpha-weak" background="surface">
        <Column vertical="center" horizontal="center" style={{ width: 64, height: 64, backgroundColor: "var(--neutral-alpha-medium)", borderRadius: "var(--radius-m)" }}>
          <Icon name="music" size="m" onBackground="neutral-weak" />
        </Column>
        <Column gap="4">
          <Text variant="body-default-m" onBackground="neutral-weak">Loading Spotify...</Text>
        </Column>
      </Row>
    );
  }

  if (!data || !data.title) {
    return (
      <Row vertical="center" gap="16" padding="16" radius="l" border="neutral-alpha-weak" background="surface">
        <Column vertical="center" horizontal="center" style={{ width: 64, height: 64, backgroundColor: "var(--neutral-alpha-medium)", borderRadius: "var(--radius-m)" }}>
          <Icon name="music" size="m" onBackground="neutral-weak" />
        </Column>
        <Column gap="4">
          <Text variant="body-default-m" onBackground="neutral-weak">Not playing anything right now</Text>
        </Column>
      </Row>
    );
  }

  const progressPercent = data.durationMs ? Math.min((progress / data.durationMs) * 100, 100) : 0;
  
  // Calculate animation speed based on tempo (BPM)
  // Default to 120bpm if not provided
  // 60 / BPM = seconds per beat
  const tempo = data.tempo || 120;
  const bounceDuration = 60 / tempo;

  return (
    <Link href={data.songUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", width: "100%" }}>
      <Column 
        fillWidth
        gap="12"
        paddingY="12"
        style={{ transition: "all 0.3s ease", cursor: "pointer" }}
        className="hover-bg-neutral-alpha-weak"
      >
        <Row vertical="center" gap="16" fillWidth>
          <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
            <img 
              src={data.albumImageUrl} 
              alt={data.title} 
              style={{ 
                width: "100%", 
                height: "100%", 
                borderRadius: "2px", 
                objectFit: "cover",
                filter: data.isPlaying ? "none" : "grayscale(100%)",
                opacity: data.isPlaying ? 1 : 0.6,
                transition: "all 0.5s ease"
              }} 
            />
          </div>
          <Column gap="4" fillWidth>
            <Row vertical="center" horizontal="between" fillWidth>
              <Column gap="0">
                <Text variant="label-default-s" onBackground="neutral-weak" style={{ textTransform: "uppercase", letterSpacing: "1px", fontSize: "10px", marginBottom: "4px" }}>
                  {data.isPlaying ? "currently playing" : "last played"}
                </Text>
                <Text variant="body-strong-m" onBackground="neutral-strong">
                  {data.title}
                </Text>
                <Text variant="body-default-s" onBackground="neutral-weak">
                  {data.artist}
                </Text>
              </Column>
              {data.isPlaying && (
                <Row 
                  vertical="center" 
                  horizontal="center" 
                  gap="2" 
                  style={{ 
                    height: "20px", 
                    width: "32px", 
                    backgroundColor: "var(--neutral-alpha-weak)", 
                    borderRadius: "12px",
                    padding: "4px 8px"
                  }}
                >
                  <div className="bar" style={{ height: "40%", width: "3px", backgroundColor: "var(--neutral-on-background-strong)", borderRadius: "1px", animationDuration: `${bounceDuration}s` }} />
                  <div className="bar" style={{ height: "80%", width: "3px", backgroundColor: "var(--neutral-on-background-strong)", borderRadius: "1px", animationDuration: `${bounceDuration * 0.8}s` }} />
                  <div className="bar" style={{ height: "50%", width: "3px", backgroundColor: "var(--neutral-on-background-strong)", borderRadius: "1px", animationDuration: `${bounceDuration * 1.2}s` }} />
                </Row>
              )}
            </Row>
          </Column>
        </Row>
        
        {data.durationMs && data.isPlaying && (
          <div style={{ 
            width: "100%", 
            height: "1px", 
            backgroundColor: "var(--neutral-alpha-weak)", 
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{ 
              width: `${progressPercent}%`, 
              height: "100%", 
              backgroundColor: "var(--neutral-on-background-strong)",
              transition: "width 1s linear"
            }} />
          </div>
        )}

        <style jsx>{`
          .bar {
            animation: bounce 0s infinite alternate ease-in-out;
          }
          @keyframes bounce {
            from { height: 30%; }
            to { height: 100%; }
          }
        `}</style>
      </Column>
    </Link>
  );
};
