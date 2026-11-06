import { bookingConfig } from "./config";
import { formatRange } from "./time";

// Google Calendar already sends the guest a calendar invite. These emails add
// the cancel/reschedule link and notify the owner. Sent through Sendbyte
// (https://docs.sendbyte.africa). Without SENDBYTE_API_KEY they are skipped.

const SENDBYTE_URL = "https://api.sendbyte.africa/v1/emails";

type Booking = {
  title: string;
  start: string;
  end: string;
  guestName: string;
  guestEmail: string;
  guestTz: string;
  meetLink?: string;
  manageUrl: string;
  answers?: { label: string; value: string }[];
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(body: string) {
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;font-size:15px;line-height:1.5;color:#111;max-width:520px">${body}</div>`;
}

async function send(to: string, subject: string, html: string, replyTo?: string) {
  const key = process.env.SENDBYTE_API_KEY;
  const from = process.env.BOOKING_FROM_EMAIL;
  if (!key || !from) return;
  try {
    const res = await fetch(SENDBYTE_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
        text: htmlToText(html),
        ...(replyTo ? { reply_to: replyTo } : {}),
        tags: ["scheduler"],
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error("[booking] Sendbyte error", res.status, body?.error?.code, body?.error?.message, res.headers.get("x-request-id"));
    }
  } catch (err) {
    console.error("[booking] email failed", err);
  }
}

/** Plain-text alternative for clients that don't render HTML. */
function htmlToText(html: string) {
  return html
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/g, "$2 ($1)")
    .replace(/<br\s*\/?>/g, "\n")
    .replace(/<\/p>/g, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const ownerInbox = () => process.env.BOOKING_NOTIFY_EMAIL || bookingConfig.ownerEmail;

export async function sendBooked(b: Booking, kind: "booked" | "rescheduled") {
  const when = formatRange(b.start, b.end, b.guestTz);
  const ownerWhen = formatRange(b.start, b.end, bookingConfig.timezone);
  const verb = kind === "booked" ? "confirmed" : "rescheduled";
  const meet = b.meetLink ? `<p><a href="${b.meetLink}">Join Google Meet</a></p>` : "";
  const answers = (b.answers ?? [])
    .filter((a) => a.value)
    .map((a) => `<p><strong>${esc(a.label)}</strong><br/>${esc(a.value).replace(/\n/g, "<br/>")}</p>`)
    .join("");

  await Promise.all([
    send(
      b.guestEmail,
      `${b.title} with ${bookingConfig.ownerName}: ${verb}`,
      layout(
        `<p>Hi ${esc(b.guestName)},</p>
         <p>Your <strong>${esc(b.title)}</strong> with ${esc(bookingConfig.ownerName)} is ${verb}.</p>
         <p>${when} (${esc(b.guestTz)})</p>${meet}
         <p>A calendar invite is on its way. Need to change something?
         <a href="${b.manageUrl}">Reschedule or cancel</a>.</p>`,
      ),
      bookingConfig.ownerEmail,
    ),
    send(
      ownerInbox(),
      `${kind === "booked" ? "New booking" : "Rescheduled"}: ${b.title} with ${b.guestName}`,
      layout(
        `<p><strong>${esc(b.guestName)}</strong> (${esc(b.guestEmail)})</p>
         <p>${ownerWhen}</p>${meet}${answers}`,
      ),
      b.guestEmail,
    ),
  ]);
}

export async function sendCancelled(b: Omit<Booking, "manageUrl" | "meetLink" | "answers">, by: "guest" | "owner", reason?: string) {
  const r = reason ? `<p>Reason: ${esc(reason)}</p>` : "";
  await Promise.all([
    send(
      b.guestEmail,
      `Cancelled: ${b.title} with ${bookingConfig.ownerName}`,
      layout(
        `<p>Hi ${esc(b.guestName)},</p>
         <p>Your ${esc(b.title)} on ${formatRange(b.start, b.end, b.guestTz)} has been cancelled${by === "owner" ? ` by ${esc(bookingConfig.ownerName)}` : ""}.</p>${r}`,
      ),
      bookingConfig.ownerEmail,
    ),
    by === "guest"
      ? send(
          ownerInbox(),
          `Cancelled: ${b.title} with ${b.guestName}`,
          layout(`<p>${esc(b.guestName)} cancelled ${formatRange(b.start, b.end, bookingConfig.timezone)}.</p>${r}`),
          b.guestEmail,
        )
      : Promise.resolve(),
  ]);
}
