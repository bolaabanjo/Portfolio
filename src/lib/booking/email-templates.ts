// Email templates for the scheduler, in the same plain style as the Cencori
// onboarding email: no background colour (the inbox's own shows through, and
// Gmail/Apple Mail handle dark mode themselves), one 560px column, system font,
// a solid #111 button, underlined links with an arrow, a quiet centred footer.

import { baseURL } from "@/resources";
import { bookingConfig } from "./config";
import { formatInTz } from "./time";

export type EmailContent = { subject: string; html: string; text: string };

type Answer = { label: string; value: string };

export type BookingEmail = {
  title: string; // event type title, e.g. "Chat"
  start: string;
  end: string;
  guestName: string;
  guestEmail: string;
  guestTz: string;
  meetLink?: string;
  manageUrl?: string;
  answers?: Answer[];
  /** Old time, for reschedules. */
  previous?: { start: string; end: string };
  reason?: string;
};

// ---- Formatting ---------------------------------------------------------------

const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);

const site = () => (process.env.BOOKING_BASE_URL || baseURL).replace(/\/$/, "");
const owner = bookingConfig.ownerName;
const ownerFirst = owner.split(/\s+/)[0];
const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;

const day = (iso: string, tz: string) =>
  formatInTz(iso, tz, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

const clock = (iso: string, tz: string) =>
  formatInTz(iso, tz, { hour: "numeric", minute: "2-digit" }).replace(" AM", "am").replace(" PM", "pm");

function zoneLabel(tz: string, at: string) {
  const offset =
    new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" })
      .formatToParts(new Date(at))
      .find((p) => p.type === "timeZoneName")?.value ?? "";
  const city = tz.split("/").pop()!.replace(/_/g, " ");
  return `${city}, ${offset === "GMT" ? "GMT+0" : offset}`;
}

/** "Monday, November 9, 2026" and "1:00am – 1:30am (Los Angeles, GMT-8)". */
const when = (start: string, end: string, tz: string) => ({
  date: day(start, tz),
  time: `${clock(start, tz)} – ${clock(end, tz)} (${zoneLabel(tz, start)})`,
});

const prettyUrl = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

// ---- Building blocks (Cencori launchTemplate styles) --------------------------

const P = "margin:0 0 24px;font-size:14px;line-height:1.6;color:#555;";

const paragraph = (html: string) => `<p style="${P}">${html}</p>`;

const arrowLink = (label: string, href: string) =>
  `<a href="${esc(href)}" style="color:#111;text-decoration:underline;">${esc(label)} &#8594;</a>`;

const button = (label: string, href: string, iconSrc?: string) =>
  iconSrc
    ? `<a href="${esc(href)}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:9px 18px 9px 14px;border-radius:6px;font-size:13px;font-weight:500;line-height:20px;"><img src="${esc(iconSrc)}" width="18" height="14" alt="" style="display:inline-block;width:18px;height:14px;border:0;vertical-align:middle;margin:0 8px 2px 0;"><span style="vertical-align:middle;">${esc(label)}</span></a>`
    : `<a href="${esc(href)}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:500;">${esc(label)}</a>`;

/** Join button with the Google Meet logo (PNG: Gmail doesn't render SVG). */
const meetButton = (href: string) => button("Join Google Meet", href, `${site()}/images/email/google-meet.png`);

type Row = { label: string; html: string };

/** Light grey details box with label/value rows. */
function details(rows: Row[]) {
  const body = rows
    .map(
      (r, i) => `<tr>
  <td valign="top" style="padding:${i === 0 ? "0" : "14px"} 16px 0 0;width:64px;font-size:12px;line-height:1.6;color:#999;white-space:nowrap;">${esc(r.label)}</td>
  <td valign="top" style="padding:${i === 0 ? "0" : "14px"} 0 0;font-size:14px;line-height:1.6;color:#111;">${r.html}</td>
</tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;background:#f5f5f5;border-radius:8px;border-collapse:separate;">
<tr><td style="padding:20px 22px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${body}</table>
</td></tr></table>`;
}

const muted = (html: string) => `<span style="color:#999;">${html}</span>`;
const struck = (html: string) => `<span style="color:#999;text-decoration:line-through;">${html}</span>`;

function shell(o: { preheader: string; body: string; footerContext: string }) {
  const s = site();
  const avatar = `${s}${bookingConfig.ownerAvatar ?? "/images/book-avatar-2.jpg"}`;
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;color:#111;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${esc(o.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<div style="max-width:560px;margin:0 auto;padding:32px 24px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px;"><tr>
<td style="padding:0 12px 0 0;vertical-align:middle;"><img src="${esc(avatar)}" width="40" height="40" alt="${esc(owner)}" style="display:block;width:40px;height:40px;border-radius:20px;border:0;"></td>
<td style="vertical-align:middle;font-size:14px;line-height:1.3;color:#111;font-weight:600;">${esc(owner)}<br><a href="${esc(s)}" style="font-size:12px;font-weight:400;color:#999;text-decoration:none;">${esc(prettyUrl(s))}</a></td>
</tr></table>
${o.body}
<div style="margin-top:32px;padding-top:24px;border-top:1px solid #eee;">
<p style="margin:0 0 12px;font-size:12px;color:#999;text-align:center;"><a href="${esc(s)}" style="color:#888;text-decoration:underline;">${esc(prettyUrl(s))}</a> &nbsp;&middot;&nbsp; <a href="${esc(s)}/essay" style="color:#888;text-decoration:underline;">Essays</a> &nbsp;&middot;&nbsp; <a href="${esc(s)}/chat" style="color:#888;text-decoration:underline;">Book a chat</a></p>
<p style="margin:0;font-size:11px;color:#aaa;text-align:center;line-height:1.5;">${esc(o.footerContext)}</p>
</div>
</div>
</body>
</html>`;
}

const signOff = paragraph(`Talk soon,<br>${esc(ownerFirst)}`).replace("margin:0 0 24px", "margin:24px 0 0");

function textFooter(context: string) {
  return `\n\n—\n${context}\n${site()}`;
}

// ---- Guest: booked / rescheduled ---------------------------------------------

export function guestConfirmation(b: BookingEmail, kind: "booked" | "rescheduled"): EmailContent {
  const w = when(b.start, b.end, b.guestTz);
  const prev = b.previous ? when(b.previous.start, b.previous.end, b.guestTz) : null;
  const subject =
    kind === "booked" ? `Confirmed: ${b.title} with ${owner}` : `Rescheduled: ${b.title} with ${owner}`;

  const rows: Row[] = [
    {
      label: "When",
      html: `${esc(w.date)}<br>${muted(esc(w.time))}${prev ? `<br>${struck(esc(`${prev.date}, ${prev.time}`))}` : ""}`,
    },
    {
      label: "Where",
      html: b.meetLink
        ? `Google Meet<br><a href="${esc(b.meetLink)}" style="color:#555;text-decoration:underline;">${esc(prettyUrl(b.meetLink))}</a>`
        : "Google Meet (link in the calendar invite)",
    },
    { label: "Who", html: `${esc(owner)} ${muted("(host)")}<br>${esc(b.guestName)}` },
  ];

  const body = [
    paragraph(`Hi ${esc(firstName(b.guestName))},`),
    paragraph(
      kind === "booked"
        ? `Your ${esc(b.title.toLowerCase())} with ${esc(owner)} is confirmed. A calendar invite is on its way too.`
        : `Your ${esc(b.title.toLowerCase())} with ${esc(owner)} has been moved to a new time. Your calendar invite has been updated.`,
    ),
    details(rows),
    b.meetLink ? `<p style="margin:0 0 24px;">${meetButton(b.meetLink)}</p>` : "",
    b.manageUrl
      ? `<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#555;">Need to change something?</p>
<p style="margin:0 0 4px;font-size:14px;line-height:1.6;color:#555;">${arrowLink("Reschedule", `${b.manageUrl}&a=reschedule`)}</p>
<p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#555;">${arrowLink("Cancel", `${b.manageUrl}&a=cancel`)}</p>`
      : "",
    signOff,
  ].join("\n");

  const text = [
    `Hi ${firstName(b.guestName)},`,
    "",
    kind === "booked"
      ? `Your ${b.title.toLowerCase()} with ${owner} is confirmed. A calendar invite is on its way too.`
      : `Your ${b.title.toLowerCase()} with ${owner} has been moved to a new time.`,
    "",
    `When:  ${w.date}, ${w.time}`,
    ...(prev ? [`Was:   ${prev.date}, ${prev.time}`] : []),
    `Where: Google Meet${b.meetLink ? ` ${b.meetLink}` : ""}`,
    "",
    ...(b.manageUrl ? [`Reschedule: ${b.manageUrl}&a=reschedule`, `Cancel:     ${b.manageUrl}&a=cancel`, ""] : []),
    `Talk soon,\n${ownerFirst}`,
  ]
    .join("\n")
    .concat(textFooter(`You received this because you booked a call at ${prettyUrl(site())}/chat.`));

  return {
    subject,
    text,
    html: shell({
      preheader: `${w.date}, ${w.time} · Google Meet`,
      body,
      footerContext: `You received this because you booked a call at ${prettyUrl(site())}/chat. Reply to reach ${ownerFirst} directly.`,
    }),
  };
}

// ---- Owner: new / rescheduled booking ------------------------------------------

export function ownerNotification(b: BookingEmail, kind: "booked" | "rescheduled", ownerTz: string): EmailContent {
  const w = when(b.start, b.end, ownerTz);
  const prev = b.previous ? when(b.previous.start, b.previous.end, ownerTz) : null;
  const subject = kind === "booked" ? `New booking: ${b.guestName}` : `Rescheduled: ${b.guestName}`;
  const answers = (b.answers ?? []).filter((a) => a.value.trim());

  const rows: Row[] = [
    {
      label: "When",
      html: `${esc(w.date)}<br>${muted(esc(w.time))}${prev ? `<br>${struck(esc(`${prev.date}, ${prev.time}`))}` : ""}`,
    },
    {
      label: "Guest",
      html: `${esc(b.guestName)}<br><a href="mailto:${esc(b.guestEmail)}" style="color:#555;text-decoration:underline;">${esc(b.guestEmail)}</a><br>${muted(`Their time: ${esc(clock(b.start, b.guestTz))} (${esc(zoneLabel(b.guestTz, b.start))})`)}`,
    },
    {
      label: "Where",
      html: b.meetLink
        ? `<a href="${esc(b.meetLink)}" style="color:#555;text-decoration:underline;">${esc(prettyUrl(b.meetLink))}</a>`
        : "Google Meet",
    },
    ...answers.map((a) => ({
      label: "Notes",
      html: `${muted(esc(a.label))}<br>${esc(a.value).replace(/\n/g, "<br>")}`,
    })),
  ];

  const body = [
    paragraph(
      kind === "booked"
        ? `${esc(b.guestName)} booked a ${esc(b.title.toLowerCase())} with you.`
        : `${esc(b.guestName)} moved their ${esc(b.title.toLowerCase())} to a new time.`,
    ),
    details(rows),
    b.meetLink ? `<p style="margin:0 0 24px;">${meetButton(b.meetLink)}</p>` : "",
    `<p style="margin:0;font-size:14px;line-height:1.6;color:#555;">${arrowLink(`Reply to ${firstName(b.guestName)}`, `mailto:${b.guestEmail}`)}</p>`,
  ].join("\n");

  const text = [
    kind === "booked"
      ? `${b.guestName} booked a ${b.title.toLowerCase()} with you.`
      : `${b.guestName} moved their ${b.title.toLowerCase()} to a new time.`,
    "",
    `When:  ${w.date}, ${w.time}`,
    ...(prev ? [`Was:   ${prev.date}, ${prev.time}`] : []),
    `Guest: ${b.guestName} <${b.guestEmail}> (their time: ${clock(b.start, b.guestTz)}, ${zoneLabel(b.guestTz, b.start)})`,
    ...(b.meetLink ? [`Meet:  ${b.meetLink}`] : []),
    ...answers.flatMap((a) => ["", a.label, a.value]),
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .concat(textFooter("Sent by the booking page on your site."));

  return {
    subject,
    text,
    html: shell({
      preheader: `${w.date}, ${w.time}`,
      body,
      footerContext: "Sent by the booking page on your site. Reply to this email to reach the guest.",
    }),
  };
}

// ---- Cancellations ------------------------------------------------------------

export function guestCancellation(b: BookingEmail, by: "guest" | "owner"): EmailContent {
  const w = when(b.start, b.end, b.guestTz);
  const rows: Row[] = [
    { label: "When", html: `${struck(esc(w.date))}<br>${struck(esc(w.time))}` },
    ...(b.reason ? [{ label: "Reason", html: esc(b.reason).replace(/\n/g, "<br>") }] : []),
  ];
  const line =
    by === "owner"
      ? `${esc(ownerFirst)} had to cancel your ${esc(b.title.toLowerCase())}. Sorry about that. Pick another time whenever suits you.`
      : `Your ${esc(b.title.toLowerCase())} with ${esc(owner)} has been cancelled. If you'd still like to talk, pick another time below.`;

  const body = [
    paragraph(`Hi ${esc(firstName(b.guestName))},`),
    paragraph(line),
    details(rows),
    `<p style="margin:0 0 24px;">${button("Book another time", `${site()}/chat`)}</p>`,
    signOff,
  ].join("\n");

  const text = [
    `Hi ${firstName(b.guestName)},`,
    "",
    line.replace(/&#39;/g, "'"),
    "",
    `Cancelled: ${w.date}, ${w.time}`,
    ...(b.reason ? [`Reason: ${b.reason}`] : []),
    "",
    `Book another time: ${site()}/chat`,
    "",
    `Talk soon,\n${ownerFirst}`,
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .concat(textFooter(`You received this because you booked a call at ${prettyUrl(site())}/chat.`));

  return {
    subject: `Cancelled: ${b.title} with ${owner}`,
    text,
    html: shell({
      preheader: `${w.date}, ${w.time} has been cancelled`,
      body,
      footerContext: `You received this because you booked a call at ${prettyUrl(site())}/chat.`,
    }),
  };
}

export function ownerCancellation(b: BookingEmail, ownerTz: string): EmailContent {
  const w = when(b.start, b.end, ownerTz);
  const rows: Row[] = [
    { label: "When", html: `${struck(esc(w.date))}<br>${struck(esc(w.time))}` },
    {
      label: "Guest",
      html: `${esc(b.guestName)}<br><a href="mailto:${esc(b.guestEmail)}" style="color:#555;text-decoration:underline;">${esc(b.guestEmail)}</a>`,
    },
    ...(b.reason ? [{ label: "Reason", html: esc(b.reason).replace(/\n/g, "<br>") }] : []),
  ];
  const body = [
    paragraph(`${esc(b.guestName)} cancelled their ${esc(b.title.toLowerCase())}. The time is free again.`),
    details(rows),
    `<p style="margin:0;font-size:14px;line-height:1.6;color:#555;">${arrowLink(`Reply to ${firstName(b.guestName)}`, `mailto:${b.guestEmail}`)}</p>`,
  ].join("\n");

  return {
    subject: `Cancelled: ${b.guestName}`,
    text: [
      `${b.guestName} cancelled their ${b.title.toLowerCase()}. The time is free again.`,
      "",
      `Was:   ${w.date}, ${w.time}`,
      `Guest: ${b.guestName} <${b.guestEmail}>`,
      ...(b.reason ? [`Reason: ${b.reason}`] : []),
    ]
      .join("\n")
      .concat(textFooter("Sent by the booking page on your site.")),
    html: shell({
      preheader: `${w.date}, ${w.time} is free again`,
      body,
      footerContext: "Sent by the booking page on your site. Reply to this email to reach the guest.",
    }),
  };
}

// ---- Generic (used by the website message form) --------------------------------

/** Wrap simple paragraphs (already-escaped HTML) in the shared layout. */
export function simpleEmail(o: { subject: string; preheader: string; paragraphsHtml: string[]; footerContext: string }): string {
  return shell({ preheader: o.preheader, body: o.paragraphsHtml.map(paragraph).join("\n"), footerContext: o.footerContext });
}
