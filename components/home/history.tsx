import Image from "next/image";
import { DriftWord } from "@/components/home/drift-word";
import { ImageReveal, LineReveal, Reveal } from "@/components/site/reveal";
import { SectionIndex } from "@/components/site/section-index";
import historyImage from "@/public/images/photo/history-pan.jpg";

const FACTS = [
  { term: "Associated with", value: "Treviso", note: "Veneto, northern Italy" },
  { term: "Modern recipe", value: "Early 1970s", note: "first documented" },
  { term: "Tira mi sù", value: "“Pick me up”", note: "a nod to the coffee" },
];

const LAYERS = ["Savoiardi", "Espresso", "Mascarpone", "Cocoa"];

export function History() {
  return (
    <section aria-labelledby="history-title" className="relative overflow-hidden bg-ivory-deep pb-24 pt-20 sm:pb-32 lg:pb-44 lg:pt-28">
      <DriftWord className="display select-none text-[clamp(6rem,24vw,22rem)] uppercase leading-[0.8] tracking-[-0.04em] text-transparent [-webkit-text-stroke:1px_rgba(0,89,44,0.28)]">
        Tiramisù · Tiramisù
      </DriftWord>

      <div className="shell relative -mt-[clamp(2rem,7vw,7rem)] grid grid-cols-1 gap-y-14 lg:grid-cols-12 lg:gap-x-8">
        <div className="relative lg:col-span-5">
          <ImageReveal className="aspect-[3/4] bg-stone shadow-[0_40px_80px_-40px_rgba(0,61,30,0.5)]">
            <Image
              src={historyImage}
              alt="A dish of Tiramisù being cut, its cocoa surface scattered beside savoiardi biscuits"
              fill
              placeholder="blur"
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </ImageReveal>
        </div>

        <div className="lg:col-span-6 lg:col-start-7 lg:pt-36">
          <SectionIndex n="02">The story of Tiramisù</SectionIndex>

          <LineReveal
            id="history-title"
            label="A Little History. A Lot of Flavor."
            className="display mt-10 text-[length:var(--text-display-lg)] text-espresso"
            lines={[
              "A Little History.",
              <span key="b" className="italic text-cocoa">
                A Lot of Flavor.
              </span>,
            ]}
          />

          <div className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-10">
            <Reveal>
              <p className="prose-editorial text-charcoal/85">
                Tiramisù is associated with Treviso in the Veneto region of northern Italy. The modern recipe was
                documented in the early 1970s, although its culinary roots may be older.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="prose-editorial text-charcoal/85">
                Its name translates to &lsquo;pick me up&rsquo;, a reference to its energizing ingredients, especially
                coffee.
              </p>
            </Reveal>
          </div>

          <dl className="mt-16 grid grid-cols-1 border-t border-espresso/15 sm:grid-cols-3">
            {FACTS.map((f, i) => (
              <Reveal
                key={f.term}
                delay={i * 0.08}
                className="border-b border-espresso/15 py-6 sm:border-b-0 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0"
              >
                <dt className="eyebrow text-espresso/55">{f.term}</dt>
                <dd className="mt-3 font-display text-[1.75rem] leading-tight text-espresso">{f.value}</dd>
                <dd className="mt-1 text-sm text-charcoal/60">{f.note}</dd>
              </Reveal>
            ))}
          </dl>

          <Reveal delay={0.1} className="mt-14">
            <p className="eyebrow text-espresso/55">The essentials</p>
            <ol className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-2 font-display text-[1.375rem] italic text-espresso sm:text-[1.625rem]">
              {LAYERS.map((l, i) => (
                <li key={l} className="flex items-baseline gap-4">
                  {l}
                  {i < LAYERS.length - 1 && (
                    <span aria-hidden className="inline-block size-1.5 -translate-y-1 rounded-full bg-gold" />
                  )}
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
