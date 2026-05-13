import { NextResponse } from "next/server";
import { getCurrentlyPlaying, getRecentlyPlayed } from "@/lib/spotify";

export const runtime = 'edge';
export const revalidate = 0; // Disable cache

export async function GET() {
  try {
    const response = await getCurrentlyPlaying();

    if (response.status === 204 || response.status > 400) {
      // Nothing is currently playing, fetch recently played
      const recentResponse = await getRecentlyPlayed();
      if (recentResponse.status === 204 || recentResponse.status > 400) {
        return NextResponse.json({ isPlaying: false });
      }

      const recentData = await recentResponse.json();
      if (!recentData.items || recentData.items.length === 0) {
        return NextResponse.json({ isPlaying: false });
      }

      const track = recentData.items[0].track;
      
      const title = track.name;
      const artist = track.artists.map((_artist: any) => _artist.name).join(", ");
      const albumImageUrl = track.album.images[0]?.url;
      const songUrl = track.external_urls.spotify;

      return NextResponse.json({
        albumImageUrl,
        artist,
        isPlaying: false,
        songUrl,
        title,
      });
    }

    const song = await response.json();

    if (song.item === null) {
      return NextResponse.json({ isPlaying: false });
    }

    const isPlaying = song.is_playing;
    const title = song.item.name;
    const artist = song.item.artists.map((_artist: any) => _artist.name).join(", ");
    const albumImageUrl = song.item.album.images[0]?.url;
    const songUrl = song.item.external_urls.spotify;
    const progressMs = song.progress_ms;
    const durationMs = song.item.duration_ms;

    return NextResponse.json({
      albumImageUrl,
      artist,
      isPlaying,
      songUrl,
      title,
      progressMs,
      durationMs,
    });
  } catch (error) {
    console.error("Spotify API Error:", error);
    return NextResponse.json({ isPlaying: false }, { status: 500 });
  }
}
