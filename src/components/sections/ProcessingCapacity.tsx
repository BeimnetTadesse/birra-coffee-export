import type { Dictionary } from "@/i18n/getDictionary";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function ProcessingCapacity({ dict }: { dict: Dictionary }) {
  const c = dict.exportPage.capacity;

  return (
    <section id="capacity" className="relative bg-cream-50 py-24 sm:py-32">
      <Container>
        <AnimatedSection>
          <Eyebrow>{c.eyebrow}</Eyebrow>
          <h2 className="mt-5 font-display text-3xl sm:text-4xl lg:text-5xl text-ink-700">
            {c.title}
          </h2>
        </AnimatedSection>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {c.items.map((it, i) => (
            <AnimatedSection
              key={it.number}
              delay={i * 0.05}
              className="rounded-xl border border-ink-700/10 bg-cream-100/60 p-7"
            >
              <span className="font-mono text-xs text-gold-600">{it.number}</span>
              <h3 className="mt-3 font-display text-xl text-ink-700">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">{it.desc}</p>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  );
}
