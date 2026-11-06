// Get a Google Calendar refresh token for the /book scheduler.
//
// 1. Google Cloud Console → enable "Google Calendar API".
// 2. OAuth consent screen: External, add yourself as a test user, then
//    click "Publish app" (in Testing mode refresh tokens expire after 7 days).
// 3. Credentials → Create OAuth client ID → "Desktop app".
// 4. Run: GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/get-google-token.mjs
// 5. Copy the printed GOOGLE_REFRESH_TOKEN into .env.local and Vercel.

import http from "node:http";
import { randomBytes } from "node:crypto";

const { GOOGLE_CLIENT_ID: clientId, GOOGLE_CLIENT_SECRET: clientSecret } = process.env;
if (!clientId || !clientSecret) {
  console.error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first.");
  process.exit(1);
}

const PORT = 53682;
const redirectUri = `http://127.0.0.1:${PORT}/callback`;
const state = randomBytes(16).toString("hex");
const scopes = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
];

const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: scopes.join(" "),
    state,
  });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, redirectUri);
  if (url.pathname !== "/callback") return res.end();
  if (url.searchParams.get("state") !== state) {
    res.end("State mismatch. Try again.");
    return;
  }
  const code = url.searchParams.get("code");
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const json = await tokenRes.json();
  if (!json.refresh_token) {
    res.end("No refresh token returned. Check the terminal.");
    console.error(json);
  } else {
    res.end("Done. You can close this tab and return to the terminal.");
    console.log(`\nGOOGLE_REFRESH_TOKEN=${json.refresh_token}\n`);
  }
  server.close();
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("\nOpen this URL and approve access to your calendar:\n");
  console.log(authUrl + "\n");
});
