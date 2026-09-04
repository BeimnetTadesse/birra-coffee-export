import Image from "next/image";
import type { Dictionary } from "@/i18n/getDictionary";
import Container from "@/components/ui/Container";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function PackingDocumentation({ dict }: { dict: Dictionary }) {
  const { packing, documents } = dict.exportPage;

  return (
    <section id="documents" className="relative bg-pine-800 py-24 sm:py-32">
      <Container className="grid gap-14 lg:grid-cols-2 lg:gap-20">
        <AnimatedSection>
          <h2 className="font-display text-3xl sm:text-4xl text-cream-100">{packing.title}</h2>
          <p className="mt-4 max-w-md text-cream-100/70">{packing.body}</p>

          <div className="mt-8 divide-y divide-cream-100/10 border-t border-cream-100/10">
            {packing.items.map((it) => (
              <div key={it.title} className="flex items-start justify-between gap-4 py-5">
                <div>
                  <div className="text-cream-100">{it.title}</div>
                  <div className="mt-1 text-sm text-cream-100/50">{it.desc}</div>
                </div>
                <span className="shrink-0 font-mono text-xs text-gold-400">{it.tag}</span>
              </div>
            ))}
          </div>

          <div className="group relative mt-6 aspect-[32/17] overflow-hidden rounded-xl bg-pine-900">
            <Image
              src="/images/coffee-export-signage.jpeg"
              alt={packing.photoCaption}
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              loading="eager"
              className="object-contain transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <span className="absolute bottom-3 start-3 font-mono text-[10px] tracking-wide text-cream-100/80 bg-pine-950/40 px-2 py-1 rounded">
              {packing.photoCaption}
            </span>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <h2 className="font-display text-3xl sm:text-4xl text-cream-100">{documents.title}</h2>
          <p className="mt-4 max-w-md text-cream-100/70">{documents.body}</p>

          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-cream-100/10 bg-cream-100/10">
            {documents.items.map((docName) => (
              <div key={docName} className="bg-pine-800 p-4 text-sm text-cream-100">
                {docName}
              </div>
            ))}
          </div>

          <div className="group relative mt-6 aspect-[16/10] overflow-hidden rounded-xl">
            <Image
              src="/images/export-warehouse.jpg"
              alt={documents.photoCaption}
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              loading="eager"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
            <span className="absolute bottom-3 start-3 font-mono text-[10px] tracking-wide text-cream-100/80 bg-pine-950/40 px-2 py-1 rounded">
              {documents.photoCaption}
            </span>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}
