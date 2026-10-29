import { DrawLine, LineReveal, Reveal } from "@/components/site/reveal";
import { SectionIndex } from "@/components/site/section-index";
import { Cta } from "@/components/site/cta";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    n: "01",
    title: "Taste",
    body: "Visit a participating restaurant and enjoy Tiramisù according to the campaign terms.",
    hover: "group-hover:text-green group-hover:[-webkit-text-stroke-color:var(--color-green)]",
    dot: "bg-green",
  },
  {
    n: "02",
    title: "Click",
    body: "Scan the QR code at your table, or open this website on your phone.",
    hover: "group-hover:text-ivory group-hover:[-webkit-text-stroke-color:var(--color-ivory)]",
    dot: "bg-ivory",
  },
  {
    n: "03",
    title: "Vote",
    body: "Rate the presentation, taste and overall experience of your Tiramisù — then submit your vote.",
    hover: "group-hover:text-red group-hover:[-webkit-text-stroke-color:var(--color-red)]",
    dot: "bg-red",
  },
];

export function HowItWorks() {
  return (
    <section
      id="experience"
      aria-labelledby="how-title"
      className="relative overflow-hidden bg-espresso-deep py-24 text-ivory sm:py-32 lg:py-40"
    >
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <SectionIndex n="03" tone="light">
              How it works
            </SectionIndex>
            <LineReveal
              id="how-title"
              label="Three Simple Steps. One Delicious Experience."
              className="display mt-10 text-[length:var(--text-display-lg)]"
              lines={[
                "Three Simple Steps.",
                <span key="b" className="italic text-gold-soft">
                  One Delicious Experience.
                </span>,
              ]}
            />
          </div>
          <Reveal className="lg:col-span-4 lg:pb-3">
            <p className="max-w-sm text-[1.0625rem] leading-relaxed text-ivory/70">
              No account, no app. Your vote takes less than a minute — straight from your table.
            </p>
          </Reveal>
        </div>

        <ol className="relative mt-20 grid gap-0 lg:mt-28 lg:grid-cols-3">
          {/* Connecting hairlines */}
          <DrawLine className="absolute left-0 right-0 top-[clamp(6.5rem,10vw,9.5rem)] hidden h-px bg-ivory/20 lg:block" />
          <DrawLine vertical className="absolute bottom-6 left-[0.3125rem] top-6 w-px bg-ivory/20 lg:hidden" />

          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 0.12} className="group relative pb-14 pl-10 last:pb-0 lg:pb-0 lg:pl-0 lg:pr-12">
                <span
                  aria-hidden
                  className={cn(
                    "display block text-[clamp(5.5rem,10vw,9rem)] leading-[0.9] text-transparent [-webkit-text-stroke:1px_rgba(248,245,239,0.4)] transition-colors duration-700 ease-[var(--ease-editorial)]",
                    s.hover,
                  )}
                >
                  {s.n}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-0 top-3 size-[0.6875rem] rounded-full ring-4 ring-espresso-deep transition-transform duration-500 group-hover:scale-150 lg:left-0 lg:top-[clamp(6.5rem,10vw,9.5rem)] lg:-translate-y-1/2",
                    s.dot,
                  )}
                />
                <h3 className="mt-6 font-display text-[2.25rem] uppercase tracking-[0.04em] lg:mt-12">
                  <span className="sr-only">Step {i + 1}: </span>
                  {s.title}
                  <span className="text-gold-soft">.</span>
                </h3>
                <p className="mt-4 max-w-[22rem] text-[1.0625rem] leading-relaxed text-ivory/70">{s.body}</p>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-20 flex flex-col items-start gap-6 border-t border-ivory/15 pt-10 sm:flex-row sm:items-center sm:justify-between lg:mt-28">
          <p className="font-display text-xl italic text-ivory/80 sm:text-2xl">Ready when you are.</p>
          <Cta href="/vote" variant="ivory">
            Start voting
          </Cta>
        </Reveal>
      </div>
    </section>
  );
}
