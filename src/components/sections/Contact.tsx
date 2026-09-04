"use client";

import { useState } from "react";
import type { Dictionary } from "@/i18n/getDictionary";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import AnimatedSection from "@/components/ui/AnimatedSection";

const EMPTY = {
  name: "",
  company: "",
  email: "",
  country: "",
  interest: "",
  quantity: "",
  message: "",
  website: "", // honeypot — must stay empty
};

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact({ dict }: { dict: Dictionary }) {
  const c = dict.contactPage;
  const f = c.form;

  const [values, setValues] = useState(EMPTY);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function update(key: keyof typeof EMPTY, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setErrorMessage(data?.error ?? f.errorGeneric);
        setStatus("error");
        return;
      }

      setValues(EMPTY);
      setStatus("sent");
    } catch {
      // Network failure — the request never reached the server.
      setErrorMessage(f.errorGeneric);
      setStatus("error");
    }
  }

  const details = [
    { label: c.emailLabel, value: dict.footer.email, href: `mailto:${dict.footer.email}` },
    { label: c.phoneLabel, value: dict.footer.phone, href: `tel:${dict.footer.phone}` },
    { label: c.officeLabel, value: c.officeValue },
    { label: c.marketsLabel, value: c.marketsValue },
  ];

  // `required` mirrors the server-side zod schema in src/lib/contact-schema.ts:
  // only name, email and message are mandatory.
  const fields = [
    { key: "name", label: f.nameLabel, placeholder: f.namePlaceholder, type: "text", required: true },
    { key: "company", label: f.companyLabel, placeholder: f.companyPlaceholder, type: "text", required: false },
    { key: "email", label: f.emailLabel, placeholder: f.emailPlaceholder, type: "email", required: true },
    { key: "country", label: f.countryLabel, placeholder: f.countryPlaceholder, type: "text", required: false },
  ];

  return (
    <section className="texture-lines relative bg-pine-900 pb-24 pt-40 sm:pb-32">
      <Container className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <AnimatedSection>
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <h1 className="mt-6 font-display text-4xl sm:text-5xl leading-[1.1] text-cream-100 text-balance">
            {c.title}
          </h1>
          <p className="mt-6 max-w-md text-cream-100/70 leading-relaxed">{c.body}</p>

          <div className="mt-10 divide-y divide-cream-100/10 border-t border-cream-100/10">
            {details.map((d) => (
              <div key={d.label} className="py-5">
                <span className="font-mono text-[10px] tracking-[0.2em] text-gold-400">
                  {d.label}
                </span>
                {d.href ? (
                  <a
                    href={d.href}
                    className="mt-1 block text-cream-100 hover:text-gold-300 transition-colors"
                  >
                    {d.value}
                  </a>
                ) : (
                  <p className="mt-1 text-cream-100">{d.value}</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={`mailto:${dict.footer.email}`}
              className="rounded-full bg-gold-400 px-7 py-3 text-sm font-medium tracking-wide text-pine-950 transition-transform hover:scale-105 hover:bg-gold-300"
            >
              {c.emailCta}
            </a>
            <a
              href="#ai-assistant"
              className="rounded-full border border-cream-100/30 px-7 py-3 text-sm tracking-wide text-cream-100 transition-colors hover:border-cream-100"
              onClick={(e) => {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("open-ai-chat"));
              }}
            >
              {c.aiCta}
            </a>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1} className="rounded-2xl bg-cream-50 p-8 sm:p-10">
          <h2 className="font-display text-2xl text-ink-700">{f.title}</h2>

          {status === "sent" ? (
            <div className="mt-8 rounded-lg border border-pine-700/20 bg-pine-700/5 px-5 py-8 text-center">
              <p className="text-ink-700">{f.success}</p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-4 text-sm font-medium text-pine-700 underline underline-offset-4 hover:text-gold-600"
              >
                {f.title}
              </button>
            </div>
          ) : (
            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
              {fields.map((field) => (
                <div key={field.key}>
                  <label
                    htmlFor={field.key}
                    className="font-mono text-[10px] tracking-[0.2em] text-ink-400"
                  >
                    {field.label}
                  </label>
                  <input
                    id={field.key}
                    name={field.key}
                    type={field.type}
                    placeholder={field.placeholder}
                    required={field.required}
                    value={values[field.key as keyof typeof EMPTY]}
                    onChange={(e) =>
                      update(field.key as keyof typeof EMPTY, e.target.value)
                    }
                    className="mt-2 w-full rounded-lg border border-ink-700/15 bg-white px-4 py-3 text-sm text-ink-700 outline-none focus:border-pine-500"
                  />
                </div>
              ))}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="interest"
                    className="font-mono text-[10px] tracking-[0.2em] text-ink-400"
                  >
                    {f.interestLabel}
                  </label>
                  <select
                    id="interest"
                    name="interest"
                    value={values.interest}
                    onChange={(e) => update("interest", e.target.value)}
                    className="mt-2 w-full rounded-lg border border-ink-700/15 bg-white px-4 py-3 text-sm text-ink-700 outline-none focus:border-pine-500"
                  >
                    <option value="">{f.interestPlaceholder}</option>
                    {f.interestOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="quantity"
                    className="font-mono text-[10px] tracking-[0.2em] text-ink-400"
                  >
                    {f.quantityLabel}
                  </label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="text"
                    placeholder={f.quantityPlaceholder}
                    value={values.quantity}
                    onChange={(e) => update("quantity", e.target.value)}
                    className="mt-2 w-full rounded-lg border border-ink-700/15 bg-white px-4 py-3 text-sm text-ink-700 outline-none focus:border-pine-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="font-mono text-[10px] tracking-[0.2em] text-ink-400"
                >
                  {f.messageLabel}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder={f.messagePlaceholder}
                  required
                  value={values.message}
                  onChange={(e) => update("message", e.target.value)}
                  className="mt-2 w-full resize-none rounded-lg border border-ink-700/15 bg-white px-4 py-3 text-sm text-ink-700 outline-none focus:border-pine-500"
                />
              </div>

              {/* Honeypot: hidden from people, irresistible to naive bots. */}
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.website}
                  onChange={(e) => update("website", e.target.value)}
                />
              </div>

              {status === "error" && (
                <p role="alert" className="text-sm text-red-700">
                  {errorMessage || f.errorGeneric}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full rounded-full bg-pine-800 px-7 py-3 text-sm font-medium tracking-wide text-cream-100 transition-colors hover:bg-pine-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? f.sending : f.submit}
              </button>
            </form>
          )}
        </AnimatedSection>
      </Container>
    </section>
  );
}
