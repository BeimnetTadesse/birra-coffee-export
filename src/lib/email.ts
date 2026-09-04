import "server-only";

import type { ContactInput } from "./contact-schema";

/**
 * Contact-form notifications.
 *
 * The provider is not chosen yet, so this deliberately degrades instead of
 * failing: with RESEND_API_KEY set it sends over Resend's REST API (no SDK
 * needed); without it, the inquiry is logged to the server console. Either way
 * the row is already committed to Postgres before this runs, so a missing or
 * broken provider delays the notification — it never loses the lead.
 *
 * To switch providers, replace the body of `send` only. Nothing else imports
 * anything provider-specific.
 */

// Identifies this deployment in notification emails and the shared database,
// since the same inbox and DATABASE_URL are used across all four Birra sites.
const SITE_NAME = "Coffee Export";

function renderInquiry(input: ContactInput, id: number): string {
  const line = (label: string, value: string) =>
    value ? `${label}: ${value}\n` : "";

  return (
    `New inquiry #${id} from the ${SITE_NAME} website\n\n` +
    line("Name", input.name) +
    line("Company", input.company) +
    line("Email", input.email) +
    line("Country", input.country) +
    line("Interest", input.interest) +
    line("Quantity", input.quantity) +
    `\nMessage:\n${input.message}\n`
  );
}

async function send(subject: string, body: string, replyTo: string) {
  const to = process.env.CONTACT_NOTIFY_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;

  if (!to) {
    console.warn("[contact] CONTACT_NOTIFY_EMAIL not set — skipping notification");
    return;
  }

  if (!apiKey) {
    console.info(
      `[contact] No email provider configured. Would have sent to ${to}:\n\n${body}`,
    );
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // Defaults to Resend's shared test sender, which works with no DNS setup
      // — but it can only deliver to the address that owns the Resend account.
      // For production set CONTACT_FROM_EMAIL to an address on a domain you
      // have verified with the provider (e.g. website@birra-group.com);
      // an unverified domain is rejected with a 403.
      from: process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev",
      to: [to],
      reply_to: replyTo,
      subject,
      text: body,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Email provider returned ${response.status}: ${await response.text()}`,
    );
  }

  // Log the provider's message id so a "they never got it" report can be traced
  // in the Resend dashboard instead of guessed at.
  const { id } = (await response.json().catch(() => ({ id: null }))) as {
    id: string | null;
  };
  console.info(`[contact] notification sent to ${to} (provider id: ${id ?? "unknown"})`);
}

export async function sendContactNotification(
  input: ContactInput,
  id: number,
): Promise<void> {
  const who = input.company ? `${input.name} (${input.company})` : input.name;
  await send(
    `New ${SITE_NAME} inquiry #${id} — ${who}`,
    renderInquiry(input, id),
    input.email,
  );
}
