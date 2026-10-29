import { SectionIndex } from "@/components/site/section-index";

/** Shared editorial frame for text pages (privacy, terms, results). */
export function TextPage({
  index,
  eyebrow,
  title,
  intro,
  children,
}: {
  index: string;
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article className="bg-ivory pb-28 pt-36 lg:pb-40 lg:pt-48">
      <div className="shell grid gap-12 lg:grid-cols-12">
        <header className="lg:col-span-5">
          <SectionIndex n={index}>{eyebrow}</SectionIndex>
          <h1 className="display mt-10 text-[length:var(--text-display-lg)] text-espresso">{title}</h1>
          {intro && <div className="mt-8 max-w-md text-[1.0625rem] leading-relaxed text-charcoal/70">{intro}</div>}
        </header>
        <div className="lg:col-span-6 lg:col-start-7 lg:pt-24">{children}</div>
      </div>
    </article>
  );
}

export function Clause({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-espresso/15 py-8">
      <h2 className="font-display text-2xl text-espresso">{title}</h2>
      <div className="mt-4 space-y-4 text-[1.0625rem] leading-relaxed text-charcoal/80 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  );
}
