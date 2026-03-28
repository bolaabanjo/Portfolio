import { ImageResponse } from "next/og";
import { baseURL, person } from "@/resources";

export const runtime = "nodejs";

export async function GET(request: Request) {
  let url = new URL(request.url);
  let title = url.searchParams.get("title") || "Portfolio";

  async function loadGoogleFont(font: string, weight: number = 400) {
    const url = `https://fonts.googleapis.com/css2?family=${font}:wght@${weight}`;
    const css = await (await fetch(url)).text();
    const resource = css.match(
      /src: url\((.+)\) format\('(opentype|truetype)'\)/
    );

    if (resource) {
      const response = await fetch(resource[1]);
      if (response.status == 200) {
        return await response.arrayBuffer();
      }
    }

    throw new Error("failed to load font data");
  }

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#0a0a0a",
        position: "relative",
      }}
    >
      {/* Subtle border frame */}
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: "24px",
          left: "24px",
          right: "24px",
          bottom: "24px",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "80px",
          flexDirection: "row",
          alignItems: "center",
          gap: "72px",
        }}
      >
        {/* Left: Avatar */}
        <img
          src={baseURL + "/images/gallery/IMG_1596%203.JPG"}
          alt={person.name}
          style={{
            width: "220px",
            height: "220px",
            objectFit: "cover",
            borderRadius: "4px",
            flexShrink: 0,
          }}
        />

        {/* Right: Text content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "0px",
            flex: 1,
          }}
        >
          {/* Name */}
          <span
            style={{
              fontFamily: "Playfair Display",
              fontSize: "56px",
              lineHeight: "64px",
              color: "#ffffff",
              letterSpacing: "-0.02em",
              fontWeight: 600,
            }}
          >
            {person.name}
          </span>

          {/* Roles */}
          <span
            style={{
              fontFamily: "Playfair Display",
              fontSize: "22px",
              lineHeight: "32px",
              color: "rgba(255,255,255,0.45)",
              letterSpacing: "0.02em",
              marginTop: "8px",
              fontStyle: "italic",
            }}
          >
            Mechanical Engineer · AI Engineer
          </span>

          {/* Separator */}
          <div
            style={{
              display: "flex",
              width: "48px",
              height: "1px",
              background: "rgba(255,255,255,0.15)",
              marginTop: "28px",
              marginBottom: "28px",
            }}
          />

          {/* Title */}
          <span
            style={{
              fontFamily: "Playfair Display",
              fontSize: "28px",
              lineHeight: "38px",
              color: "rgba(255,255,255,0.7)",
              fontStyle: "italic",
              maxWidth: "600px",
            }}
          >
            {title}
          </span>
        </div>
      </div>

      {/* Bottom URL */}
      <div
        style={{
          display: "flex",
          position: "absolute",
          bottom: "40px",
          right: "80px",
        }}
      >
        <span
          style={{
            fontFamily: "Playfair Display",
            fontSize: "16px",
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.04em",
          }}
        >
          bolabanjo.xyz
        </span>
      </div>
    </div>,
    {
      width: 1280,
      height: 720,
      fonts: [
        {
          name: "Playfair Display",
          data: await loadGoogleFont("Playfair+Display", 400),
          style: "normal",
          weight: 400,
        },
        {
          name: "Playfair Display",
          data: await loadGoogleFont("Playfair+Display", 600),
          style: "normal",
          weight: 600,
        },
      ],
    }
  );
}
