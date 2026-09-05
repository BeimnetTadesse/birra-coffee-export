"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Dictionary } from "@/i18n/getDictionary";
import type { Locale } from "@/i18n/config";
import Container from "@/components/ui/Container";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

export default function ExportHero({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const h = dict.exportPage.hero;

  return (
    <section id="hero" className="texture-lines relative bg-pine-900">
      {/* This wrapper alone claims the full first screen and centers the
          text/CTA block within it. The stats grid lives outside it, in
          normal flow, so it starts exactly at the fold — invisible until the
          visitor scrolls, never sharing the centering with the hero text. */}
      <div className="relative flex min-h-screen min-h-[100svh] flex-col justify-center overflow-hidden pt-24">
        <Image
          src="/images/hero-roasted-bags.png"
          alt="Packaged Birra Coffee, ready for export"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Dims the photo and fades it toward the pine background at the
            edges, so the text stays legible and the image blends into the
            rest of the page instead of ending in a hard rectangle. */}
        <div className="absolute inset-0 bg-pine-950/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-pine-950/80 via-pine-950/25 to-pine-950/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-pine-900/70 via-transparent to-pine-950/20" />
        <div className="texture-lines absolute inset-0 opacity-40" />

        <Container className="relative z-10">
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl">
            <motion.span
              variants={item}
              className="inline-flex items-center gap-3 font-mono text-xs tracking-[0.25em] text-gold-400"
            >
              <span className="h-px w-8 bg-gold-500/70" />
              {h.eyebrow}
            </motion.span>

            <motion.h1
              variants={item}
              className="mt-6 whitespace-pre-line font-display text-4xl sm:text-6xl leading-[1.1] text-cream-100"
            >
              {h.title}
            </motion.h1>

            <motion.p variants={item} className="mt-6 max-w-2xl text-base sm:text-lg text-cream-100/80">
              {h.body}
            </motion.p>

            <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#capacity"
                className="rounded-full bg-gold-400 px-7 py-3 text-sm font-medium tracking-wide text-pine-950 transition-transform hover:scale-105 hover:bg-gold-300"
              >
                {h.ctaPrimary}
              </a>
              <a
                href={`/${locale}/contact`}
                className="rounded-full border border-cream-100/20 px-7 py-3 text-sm font-medium tracking-wide text-cream-100 transition-colors hover:border-cream-100/50"
              >
                {h.ctaSecondary}
              </a>
            </motion.div>
          </motion.div>
        </Container>
      </div>

      <Container className="pb-16 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-cream-100/10 bg-cream-100/10 sm:grid-cols-3"
        >
          {h.stats.map((stat) => (
            <div key={stat.label} className="bg-pine-900 p-6">
              <div className="font-mono text-[10px] tracking-[0.2em] text-cream-100/40">
                {stat.label}
              </div>
              <div className="mt-2 font-display text-2xl sm:text-3xl text-cream-100">
                {stat.value}
                {stat.suffix && (
                  <span className="ms-1 text-base text-gold-400">{stat.suffix}</span>
                )}
              </div>
              <div className="mt-1 text-sm text-cream-100/50">{stat.desc}</div>
            </div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
