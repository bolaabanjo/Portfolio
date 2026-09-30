import { ImageResponse } from "next/og";

export const runtime = "edge";

const WIDTH = 1200;
const HEIGHT = 630;

async function getFont(requestUrl: string) {
  const res = await fetch(new URL("/fonts/HighnessaDemo.otf", requestUrl), {
    cache: "force-cache",
  });
  if (!res.ok) throw new Error("Failed to load OG font");
  return res.arrayBuffer();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") || "Bola Banjo").slice(0, 140);

  const fontData = await getFont(request.url).catch(() => null);

  const fontSize = title.length > 60 ? 64 : title.length > 30 ? 84 : 104;

  return new ImageResponse(
    (
      <div
        style={{
          width: `${WIDTH}px`,
          height: `${HEIGHT}px`,
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "flex-end",
          paddingLeft: "96px",
          paddingBottom: "96px",
          paddingRight: "96px",
        }}
      >
        <div
          style={{
            fontFamily: fontData ? "Highnessa" : "serif",
            fontSize: `${fontSize}px`,
            lineHeight: 1.15,
            color: "#000000",
          }}
        >
          {title}
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      ...(fontData
        ? {
            fonts: [
              {
                name: "Highnessa",
                data: fontData,
                style: "normal" as const,
              },
            ],
          }
        : {}),
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate",
      },
    },
  );
}
