import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";

export async function GET() {
  const image = await readFile(
    join(process.cwd(), "public/images/og/bola-banjo.png")
  );

  return new Response(new Uint8Array(image), {
    headers: { "Content-Type": "image/png" },
  });
}
