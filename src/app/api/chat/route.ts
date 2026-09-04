import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { z } from "zod";

import { ASSISTANT_RULES, BIRRA_KNOWLEDGE, UNKNOWN_TOPICS } from "@/lib/birra-knowledge";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Vercel kills a serverless function at 10s by default, which would truncate a
// slow reply mid-sentence. Typical responses are 3–6s; this leaves headroom for
// the occasional slow one without letting a hung request run indefinitely.
export const maxDuration = 30;

// Chat costs a request quota per message, so the cap is tighter than the
// contact form's. Google's free tier also has its own per-minute limit.
const LIMIT = { limit: 20, windowMs: 10 * 60 * 1000 }; // 20 messages per IP per 10 min

const MAX_OUTPUT_TOKENS = 1024;
const MAX_HISTORY = 20;

// Fast and free-tier friendly. If Google retires this ID, the API returns a
// clear 404 naming the replacement — swap it here, nothing else changes.
// (gemini-2.0-flash was retired; its 404 pointed here.)
const MODEL = "gemini-3.6-flash";

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000),
      }),
    )
    .min(1)
    .max(MAX_HISTORY),
  locale: z.enum(["en", "ar"]).optional().default("en"),
});

/**
 * Everything the assistant is allowed to say, assembled once at module load.
 * Sent as Gemini's systemInstruction, separate from the conversation turns.
 */
const SYSTEM_PROMPT = [
  ASSISTANT_RULES,
  "",
  "# Verified knowledge — the only facts you may state",
  BIRRA_KNOWLEDGE,
  "",
  "# Topics you must NOT answer from your own knowledge",
  "Never estimate or guess on anything below — a buyer may treat your answer",
  "as a commitment from Birra. Reply with exactly this and nothing more:",
  '"For pricing, availability, quantities, and delivery arrangements, please',
  'submit an inquiry through our contact form. Our team can provide the',
  'appropriate commercial details."',
  ...UNKNOWN_TOPICS.map((topic) => `- ${topic}`),
].join("\n");

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[chat] GEMINI_API_KEY is not set");
    return Response.json({ error: "The assistant is not available right now." }, { status: 503 });
  }

  const { ok, retryAfter } = rateLimit(`chat:${clientIp(request)}`, LIMIT);
  if (!ok) {
    return Response.json(
      { error: "You're sending messages a bit quickly — please wait a moment." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = chatSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: "Invalid message." }, { status: 400 });
  }

  const { messages, locale } = parsed.data;

  const languageNote =
    locale === "ar"
      ? "The visitor is browsing the Arabic site. Reply in Arabic unless they write in another language."
      : "The visitor is browsing the English site. Reply in English unless they write in another language.";

  try {
    const ai = new GoogleGenAI({ apiKey });

    const stream = await ai.models.generateContentStream({
      model: MODEL,
      // Gemini names the assistant role "model", not "assistant".
      contents: messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      config: {
        systemInstruction: `${SYSTEM_PROMPT}\n\n${languageNote}`,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        // Gemini 3.x reasons before answering by default, which was costing
        // 8–30s per reply. These are factual lookups against a small knowledge
        // base, so that time bought no accuracy. MINIMAL is the floor this
        // model accepts — thinkingBudget: 0 is rejected with a 400. Raise to
        // LOW if answers ever get sloppy.
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      },
    });

    const encoder = new TextEncoder();

    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        let sentAnything = false;
        try {
          for await (const chunk of stream) {
            const text = chunk.text;
            if (text) {
              sentAnything = true;
              controller.enqueue(encoder.encode(text));
            }
          }

          // A safety filter can end the stream with nothing emitted. Say
          // something useful rather than leaving an empty bubble.
          if (!sentAnything) {
            controller.enqueue(
              encoder.encode(
                "I can't help with that one. For anything about Birra's coffee or trade, please use the contact form and our team will reply directly.",
              ),
            );
          }
        } catch (error) {
          console.error("[chat] stream failed", error);
          controller.enqueue(
            encoder.encode(
              sentAnything
                ? "\n\n(The reply was cut short. Please try again.)"
                : "Something went wrong on our side. Please try again, or email contact@birra-group.com.",
            ),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[chat] request failed", error);
    return Response.json(
      { error: "The assistant is unavailable right now. Please try the contact form." },
      { status: 502 },
    );
  }
}
