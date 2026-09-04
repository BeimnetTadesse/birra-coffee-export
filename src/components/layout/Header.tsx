"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/getDictionary";
import Container from "@/components/ui/Container";
import LogoMark from "@/components/ui/Logo";

// Points at the live demo for now — swap to the real domain once registered.
const GROUP_URL = process.env.NEXT_PUBLIC_BIRRA_GROUP_URL ?? "https://birra-group.vercel.app/en";

export default function Header({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: `/${locale}#hero`, label: dict.nav.home },
    { href: `/${locale}#capacity`, label: dict.nav.processing },
    { href: `/${locale}#documents`, label: dict.nav.documentation },
    { href: `/${locale}/contact`, label: dict.nav.contact },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`transition-all duration-500 ${
          scrolled
            ? "bg-pine-900/90 backdrop-blur-md border-b border-cream-100/10 py-3"
            : "bg-gradient-to-b from-pine-950/70 to-transparent py-5"
        }`}
      >
        <Container className="flex items-center justify-between">
          <Link href={`/${locale}#hero`} className="flex items-center gap-3 lg:ms-6">
            <LogoMark className="h-8" />
            <span className="hidden text-xs tracking-[0.15em] text-cream-100/50 sm:inline">
              {dict.nav.siteLabel}
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-cream-100/80 hover:text-gold-400 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4 lg:me-6">
            <a
              href={GROUP_URL}
              className="text-xs text-cream-100/50 underline underline-offset-4 hover:text-cream-100"
            >
              {dict.nav.groupBadge}
            </a>
            <a
              href={`/${locale}/contact`}
              className="rounded-full bg-gold-400 px-5 py-2 text-sm font-medium tracking-wide text-pine-950 transition-colors hover:bg-gold-300"
            >
              {dict.nav.cta}
            </a>
          </div>

          <button
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden flex flex-col gap-1.5 p-2"
          >
            <span
              className={`h-px w-6 bg-cream-100 transition-transform ${open ? "translate-y-[3px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-6 bg-cream-100 transition-transform ${open ? "-translate-y-[3px] -rotate-45" : ""}`}
            />
          </button>
        </Container>
      </div>

      {open && (
        <div className="lg:hidden overflow-hidden bg-pine-900/95 backdrop-blur-md border-t border-cream-100/10">
          <Container className="flex flex-col gap-6 py-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-lg text-cream-100"
              >
                {link.label}
              </a>
            ))}
            <a href={GROUP_URL} className="text-sm text-cream-100/50 underline underline-offset-4">
              {dict.nav.groupBadge}
            </a>
          </Container>
        </div>
      )}
    </header>
  );
}
