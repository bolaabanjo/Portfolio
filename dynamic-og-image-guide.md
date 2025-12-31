# Dynamic OG Image Generation in Next.js

A step-by-step guide to creating auto-generated social preview images for blog posts and pages without custom cover images.

---

## Prerequisites

- Next.js 13+ with App Router
- Node.js runtime (not Edge, for font loading)

---

## Step 1: Create the OG API Route

Create the file `src/app/api/og/route.tsx`:

```tsx
import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title = url.searchParams.get("title") || "Default Title";

  // Load a custom font (optional)
  async function loadGoogleFont(font: string) {
    const fontUrl = `https://fonts.googleapis.com/css2?family=${font}`;
    const css = await (await fetch(fontUrl)).text();
    const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);

    if (resource) {
      const response = await fetch(resource[1]);
      if (response.status === 200) {
        return await response.arrayBuffer();
      }
    }
    throw new Error("Failed to load font");
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: "80px",
          background: "#151515",
          color: "white",
        }}
      >
        <span
          style={{
            fontSize: "72px",
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
          }}
        >
          {title}
        </span>

        {/* Author section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginTop: "48px",
          }}
        >
          <img
            src="https://yourdomain.com/avatar.jpg"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "32px" }}>Your Name</span>
            <span style={{ fontSize: "20px", opacity: 0.6 }}>Your Role</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Geist",
          data: await loadGoogleFont("Geist:wght@600"),
          style: "normal",
        },
      ],
    }
  );
}
```

---

## Step 2: Use the OG Image in Metadata

In your page (e.g., `src/app/blog/[slug]/page.tsx`):

```tsx
import { Metadata } from "next";

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      images: [
        post.image || `/api/og?title=${encodeURIComponent(post.title)}`,
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: [
        post.image || `/api/og?title=${encodeURIComponent(post.title)}`,
      ],
    },
  };
}
```

> [!IMPORTANT]
> Always use `encodeURIComponent()` on dynamic text to handle special characters safely.

---

## Step 3: Test Your OG Image

1. **Direct URL test**: Visit `/api/og?title=Hello World` in your browser
2. **Social debuggers**:
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

---

## Customization Options

### Dynamic Author Info

Pass additional query params:

```tsx
const author = url.searchParams.get("author") || "Default Author";
const role = url.searchParams.get("role") || "Developer";
```

### Different Layouts per Content Type

```tsx
const type = url.searchParams.get("type") || "blog";

// Render different layouts based on type
if (type === "project") {
  return new ImageResponse(<ProjectLayout title={title} />, options);
}
return new ImageResponse(<BlogLayout title={title} />, options);
```

### Using Local Fonts

Instead of loading from Google, use a local font file:

```tsx
import { readFileSync } from "fs";
import { join } from "path";

const fontPath = join(process.cwd(), "public", "fonts", "MyFont.ttf");
const fontData = readFileSync(fontPath);

// Use in ImageResponse options
fonts: [{ name: "MyFont", data: fontData, style: "normal" }];
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| Image not updating | Social platforms cache aggressively—add a version param like `?v=2` |
| Font not loading | Ensure `runtime = "nodejs"` (Edge runtime has limited font support) |
| Image looks blurry | Use 1200×630 dimensions (optimal for most platforms) |
| Avatar not showing | Use absolute URLs with `https://` for images |

---

## File Structure

```
src/
└── app/
    └── api/
        └── og/
            └── route.tsx    ← OG image generator
```

That's it! Every page can now generate branded social preview cards dynamically.
