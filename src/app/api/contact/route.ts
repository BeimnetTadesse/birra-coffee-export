import { NextResponse } from "next/server";

import { contactSchema } from "@/lib/contact-schema";
import { query } from "@/lib/db";
import { sendContactNotification } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/rate-limit";

// Touches the database on every call, so it must never be statically rendered.
export const dynamic = "force-dynamic";

// A cold database connection plus the outbound email call can exceed Vercel's
// 10s default. 20s is ample and still fails fast if something is genuinely stuck.
export const maxDuration = 20;

const LIMIT = { limit: 5, windowMs: 10 * 60 * 1000 }; // 5 per IP per 10 minutes

export async function POST(request: Request) {
  // 1. Rate limit before doing any work.
  const { ok, retryAfter } = rateLimit(`contact:${clientIp(request)}`, LIMIT);
  if (!ok) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  // 2. Parse and validate.
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please check the highlighted fields.",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const input = parsed.data;

  // 3. Honeypot. Report success so the bot has no signal to adapt to, but
  //    store nothing — a real user cannot reach this branch.
  if (input.website) {
    return NextResponse.json({ ok: true });
  }

  // 4. Persist first. If the mail provider is down we still have the lead.
  // source_site is fixed per deployment, not user input — it's how the
  // shared admin view tells this site's leads apart from the other three.
  let id: number;
  try {
    const rows = await query<{ id: string }>(
      `INSERT INTO contact_submissions
         (name, company, email, country, interest, quantity, message, source_site)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'export')
       RETURNING id`,
      [
        input.name,
        input.company || null,
        input.email,
        input.country || null,
        input.interest || null,
        input.quantity || null,
        input.message,
      ],
    );
    id = Number(rows[0]!.id);
  } catch (error) {
    console.error("[contact] database insert failed", error);
    return NextResponse.json(
      { error: "Something went wrong on our side. Please email us directly." },
      { status: 500 },
    );
  }

  // 5. Notify. A failure here is logged but not surfaced — the inquiry is
  //    safely stored, so telling the user it failed would be wrong.
  try {
    await sendContactNotification(input, id);
  } catch (error) {
    console.error(`[contact] notification failed for submission #${id}`, error);
  }

  return NextResponse.json({ ok: true });
}
