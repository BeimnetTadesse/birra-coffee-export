"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Dictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";

type Message = { role: "bot" | "user"; text: string };

export default function AiChatLauncher({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const ai = dict.aiChat;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "bot", text: ai.greeting }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [tastes, setTastes] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  function toggleTaste(note: string) {
    setTastes((current) =>
      current.includes(note) ? current.filter((n) => n !== note) : [...current, note],
    );
  }

  function askForRecommendation() {
    if (tastes.length === 0 || typing) return;
    // Ask in natural language so the model answers from the knowledge base
    // rather than us hard-coding a flavour → origin lookup here.
    ask(ai.tastePrompt.replace("{tastes}", tastes.join(", ")));
    setTastes([]);
  }

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-ai-chat", handler);
    return () => window.removeEventListener("open-ai-chat", handler);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  async function ask(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    // Snapshot the history the model should see. Taken before the optimistic
    // update so the user's new turn isn't counted twice.
    const history = messages
      .slice(1) // drop the canned greeting — it isn't part of the conversation
      .map((m) => ({ role: m.role === "bot" ? ("assistant" as const) : ("user" as const), content: m.text }));

    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          messages: [...history, { role: "user", content: trimmed }],
        }),
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => null);
        setTyping(false);
        setMessages((m) => [...m, { role: "bot", text: data?.error ?? ai.fallback }]);
        return;
      }

      // Open an empty bubble, then append each chunk to it as it arrives.
      setTyping(false);
      setMessages((m) => [...m, { role: "bot", text: "" }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = {
            role: "bot",
            text: next[next.length - 1]!.text + chunk,
          };
          return next;
        });
      }
    } catch {
      setTyping(false);
      setMessages((m) => [...m, { role: "bot", text: ai.fallback }]);
    }
  }

  return (
    <div className="fixed bottom-6 end-6 z-[60]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 end-0 flex h-[min(34rem,80vh)] w-[92vw] max-w-sm flex-col overflow-hidden rounded-2xl border border-cream-100/10 bg-pine-900 shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-cream-100/10 px-5 py-4">
              <span className="h-2 w-2 rounded-full bg-gold-400" />
              <h3 className="font-display text-lg text-cream-100">{ai.title}</h3>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="ms-auto flex h-6 w-6 items-center justify-center rounded-full text-cream-100/60 transition-colors hover:text-cream-100"
              >
                ×
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "bot"
                      ? "bg-pine-800 text-cream-100/90"
                      : "ms-auto bg-gold-400 text-pine-950"
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {typing && (
                <div className="flex w-fit items-center gap-1 rounded-2xl bg-pine-800 px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cream-100/50 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cream-100/50 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cream-100/50" />
                </div>
              )}
            </div>

            <div className="border-t border-cream-100/10 px-5 pb-3 pt-3">
              <span className="font-mono text-[9px] tracking-[0.2em] text-cream-100/30">
                {ai.tasteLabel}
              </span>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {ai.tasteOptions.map((note) => {
                  const picked = tastes.includes(note);
                  return (
                    <button
                      key={note}
                      onClick={() => toggleTaste(note)}
                      disabled={typing}
                      aria-pressed={picked}
                      className={`rounded-full border px-3 py-1.5 text-xs transition-colors disabled:opacity-50 ${
                        picked
                          ? "border-gold-400 bg-gold-400 text-pine-950"
                          : "border-cream-100/15 text-cream-100/70 hover:border-gold-400/50 hover:text-gold-400"
                      }`}
                    >
                      {note}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {tastes.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onClick={askForRecommendation}
                    disabled={typing}
                    className="mt-2.5 w-full overflow-hidden rounded-full bg-gold-400 py-2 text-xs font-medium tracking-wide text-pine-950 transition-colors hover:bg-gold-300 disabled:opacity-50"
                  >
                    {ai.tasteCta} ({tastes.length})
                  </motion.button>
                )}
              </AnimatePresence>

              <span className="mt-4 block font-mono text-[9px] tracking-[0.2em] text-cream-100/30">
                {ai.quickLabel}
              </span>
              <div className="scroll-drag mt-2 flex gap-1.5 overflow-x-auto pb-1">
                {ai.quickQuestions.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => ask(item.prompt)}
                    disabled={typing}
                    className="shrink-0 whitespace-nowrap rounded-full border border-cream-100/15 px-3 py-1.5 text-xs text-cream-100/70 transition-colors hover:border-gold-400/50 hover:text-gold-400 disabled:opacity-50"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
              className="flex items-center gap-2 border-t border-cream-100/10 px-4 py-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={ai.inputPlaceholder}
                className="flex-1 rounded-full bg-cream-100/5 px-4 py-2 text-sm text-cream-100 placeholder:text-cream-100/40 outline-none focus:bg-cream-100/10"
              />
              <button
                type="submit"
                disabled={typing}
                className="shrink-0 rounded-full bg-gold-400 px-4 py-2 text-sm font-medium text-pine-950 transition-colors hover:bg-gold-300 disabled:opacity-50"
              >
                {ai.sendLabel}
              </button>
            </form>

            <div className="border-t border-cream-100/10 px-5 py-3">
              <p className="text-xs text-cream-100/50">{ai.meanwhile}</p>
              <a
                href={`mailto:${dict.footer.email}`}
                className="mt-1 inline-block text-xs text-gold-400 underline underline-offset-4 hover:text-gold-300"
              >
                {ai.emailCta} →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-full bg-pine-800/90 backdrop-blur-md px-4 py-2 text-sm text-cream-100 shadow-xl ring-1 ring-cream-100/15 transition-all hover:scale-105"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-400 text-xs font-bold text-pine-950 font-sans">
          B
        </span>
        <span className="font-sans text-xs font-medium tracking-wide">{ai.launcher}</span>
      </button>
    </div>
  );
}
