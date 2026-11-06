import { bookingConfig } from "./config";
import {
  esc,
  guestCancellation,
  guestConfirmation,
  ownerCancellation,
  ownerNotification,
  simpleEmail,
  type BookingEmail,
  type EmailContent,
} from "./email-templates";

// Google Calendar already sends the guest a calendar invite. These emails add
// the cancel/reschedule link and notify the owner. Sent through Sendbyte
// (https://docs.sendbyte.africa). Without SENDBYTE_API_KEY they are skipped.

const SENDBYTE_URL = "https://api.sendbyte.africa/v1/emails";

type Booking = BookingEmail & { manageUrl: string };

async function send(to: string, subject: string, html: string, replyTo?: string, text?: string): Promise<boolean> {
  const key = process.env.SENDBYTE_API_KEY;
  const from = process.env.BOOKING_FROM_EMAIL;
  if (!key || !from) return false;
  try {
    const res = await fetch(SENDBYTE_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
        text: text ?? htmlToText(html),
        ...(replyTo ? { reply_to: replyTo } : {}),
        tags: ["scheduler"],
      }),
      cache: "no-store",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error("[booking] Sendbyte error", res.status, body?.error?.code, body?.error?.message, res.headers.get("x-request-id"));
    }
    return res.ok;
  } catch (err) {
    console.error("[booking] email failed", err);
    return false;
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

const sendContent = (to: string, c: EmailContent, replyTo?: string) => send(to, c.subject, c.html, replyTo, c.text);

export async function sendBooked(b: Booking, kind: "booked" | "rescheduled") {
  await Promise.all([
    sendContent(b.guestEmail, guestConfirmation(b, kind), bookingConfig.ownerEmail),
    sendContent(ownerInbox(), ownerNotification(b, kind, bookingConfig.timezone), b.guestEmail),
  ]);
}

export async function sendCancelled(
  b: Omit<Booking, "manageUrl" | "meetLink" | "answers">,
  by: "guest" | "owner",
  reason?: string,
) {
  const details = { ...b, reason };
  await Promise.all([
    sendContent(b.guestEmail, guestCancellation(details, by), bookingConfig.ownerEmail),
    by === "guest" ? sendContent(ownerInbox(), ownerCancellation(details, bookingConfig.timezone), b.guestEmail) : Promise.resolve(),
  ]);
}

/** A message a visitor left with Nicole's front desk while she was offline. */
export async function sendVisitorMessage(m: { name: string; email: string; message: string }) {
  return send(
    ownerInbox(),
    `Website message from ${m.name}`,
    simpleEmail({
      subject: `Website message from ${m.name}`,
      preheader: m.message.slice(0, 120),
      paragraphsHtml: [
        `<strong style="color:#111;">${esc(m.name)}</strong> (${esc(m.email)}) left a message on your website while Nicole was offline:`,
        esc(m.message).replace(/\n/g, "<br>"),
      ],
      footerContext: "Sent from the message form on your site. Reply to this email to reach them.",
    }),
    m.email,
  );
}
