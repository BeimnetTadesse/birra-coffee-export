import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/getDictionary";
import Container from "@/components/ui/Container";
import LogoMark from "@/components/ui/Logo";

// Group site points at the live demo for now; siblings are still placeholders
// until real domains exist — update each once registered.
const GROUP_URL = process.env.NEXT_PUBLIC_BIRRA_GROUP_URL ?? "https://birra-group.vercel.app/en";
const ROASTERY_URL = process.env.NEXT_PUBLIC_BIRRA_ROASTERY_URL ?? "https://birra-roastery.com";
const LIVING_URL = process.env.NEXT_PUBLIC_BIRRA_LIVING_URL ?? "https://birra-living.com";

export default function Footer({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const f = dict.footer;

  return (
    <footer className="relative border-t border-cream-100/10 bg-pine-950 py-16">
      <Container>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <LogoMark className="h-8" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream-100/60">
              {f.description}
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs tracking-[0.2em] text-gold-400">
              {f.contactTitle}
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-cream-100/70">
              <li>
                <a href={`mailto:${f.email}`} className="hover:text-cream-100">
                  {f.email}
                </a>
              </li>
              <li>
                <a href={`tel:${f.phone}`} className="hover:text-cream-100">
                  {f.phone}
                </a>
              </li>
              <li>{f.addressLine2}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs tracking-[0.2em] text-gold-400">
              {f.groupTitle}
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href={GROUP_URL} className="text-cream-100/70 hover:text-cream-100">
                  {f.groupLink}
                </a>
              </li>
              <li>
                <a href={ROASTERY_URL} className="text-cream-100/70 hover:text-cream-100">
                  {f.roasteryLink}
                </a>
              </li>
              <li>
                <a href={LIVING_URL} className="text-cream-100/70 hover:text-cream-100">
                  {f.livingLink}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs tracking-[0.2em] text-gold-400">
              {f.exploreTitle}
            </h4>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href={`/${locale}#capacity`} className="text-cream-100/70 hover:text-cream-100">
                  {f.processingLink}
                </a>
              </li>
              <li>
                <a href={`/${locale}/contact`} className="text-cream-100/70 hover:text-cream-100">
                  {f.contactLink}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-cream-100/10 pt-6 text-xs text-cream-100/40">
          {f.copyright}
        </div>
      </Container>
    </footer>
  );
}
