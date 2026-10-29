import Image from "next/image";
import { DrawLine, ImageReveal, LineReveal, Reveal } from "@/components/site/reveal";
import { SectionIndex } from "@/components/site/section-index";
import storyImage from "@/public/images/photo/story-slice.jpg";
import poster from "@/public/images/terama.png";

export function Story() {
  return (
    <section id="about" aria-labelledby="story-title" className="relative bg-ivory py-24 sm:py-32 lg:py-44">
      <div className="shell grid grid-cols-1 gap-y-16 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-7">
          <SectionIndex n="01">A celebration of Italian culture</SectionIndex>

          <LineReveal
            id="story-title"
            label="More Than a Dessert. An Italian Experience."
            className="display mt-10 text-[length:var(--text-display-lg)] text-espresso"
            lines={[
              "More Than a Dessert.",
              <span key="b" className="italic text-green-deep">
                An Italian
              </span>,
              <span key="c" className="italic text-green-deep">
                Experience.
              </span>,
            ]}
          />

          <div className="mt-14 grid gap-10 sm:grid-cols-[auto_minmax(0,1fr)] lg:mt-20 lg:pl-[16.666%]">
            <DrawLine vertical className="tricolore-v hidden h-full sm:block" />
            <Reveal delay={0.1}>
              <p className="prose-editorial max-w-[34rem] text-charcoal/85 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-[4.25rem] first-letter:leading-[0.8] first-letter:text-espresso">
                In celebration of the Week of Italian Cuisine in the World (#SCIM2026), the Embassy of Italy in Mogadishu
                invites you to discover the artistry, tradition, and flavors behind one of Italy&rsquo;s most beloved
                desserts.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="mt-16 lg:mt-24 lg:pl-[16.666%]">
            <a
              href="/images/terama.png"
              target="_blank"
              rel="noopener"
              className="group flex max-w-md items-end gap-6"
            >
              <span className="relative block w-28 shrink-0 overflow-hidden bg-stone shadow-[0_24px_40px_-24px_rgba(30,21,17,0.45)] sm:w-32">
                <Image
                  src={poster}
                  alt="The official Taste, Click & Vote campaign poster"
                  sizes="128px"
                  className="h-auto w-full transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-[1.04]"
                />
              </span>
              <span className="pb-1">
                <span className="eyebrow block text-espresso/55">The official poster</span>
                <span className="mt-2 block font-display text-lg leading-snug text-espresso">
                  Embassy of Italy in Mogadishu
                  <span className="text-espresso/50"> &amp; </span>
                  Italian Trade Agency
                </span>
                <span className="link-underline mt-3 inline-block pb-0.5 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-green-deep">
                  View full poster
                </span>
              </span>
            </a>
          </Reveal>
        </div>

        <div className="relative lg:col-span-5 lg:pt-40">
          <ImageReveal className="aspect-[4/5] bg-stone">
            <Image
              src={storyImage}
              alt="A slice of classic Tiramisù on a porcelain plate, dusted with cocoa, on a sunlit café table"
              fill
              placeholder="blur"
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover"
            />
          </ImageReveal>
          <div className="mt-5 flex items-baseline justify-between gap-6 border-t border-espresso/15 pt-4">
            <span className="eyebrow text-espresso/60">Fig. 02</span>
            <span className="font-display text-sm italic text-espresso/70">Savoiardi, mascarpone, espresso, cocoa.</span>
          </div>
          <span
            aria-hidden
            className="pointer-events-none absolute -right-2 -top-6 hidden select-none font-display text-[11rem] italic leading-none text-stone lg:block xl:-top-10 xl:text-[13rem]"
          >
            01
          </span>
        </div>
      </div>
    </section>
  );
}
