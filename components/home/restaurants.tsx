import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { PublicRestaurant } from "@/lib/campaign";
import { LineReveal, Reveal } from "@/components/site/reveal";
import { SectionIndex } from "@/components/site/section-index";
import { SmartImage } from "@/components/site/smart-image";
import { cn } from "@/lib/utils";

export function Restaurants({ restaurants }: { restaurants: PublicRestaurant[] }) {
  return (
    <section id="restaurants" aria-labelledby="restaurants-title" className="relative bg-ivory py-24 sm:py-32 lg:py-44">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionIndex n="04">Participating restaurants</SectionIndex>
            <LineReveal
              id="restaurants-title"
              label="Where Italy Meets Mogadishu"
              className="display mt-10 text-[length:var(--text-display-lg)] text-espresso"
              lines={[
                "Where Italy",
                <span key="b">
                  <span className="italic text-red">Meets</span> Mogadishu
                </span>,
              ]}
            />
          </div>
          <Reveal className="lg:col-span-4 lg:col-start-9 lg:pb-3">
            <p className="prose-editorial text-charcoal/75">
              Discover the participating restaurants and celebrate the flavors of Italian cuisine.
            </p>
            <p className="eyebrow mt-6 text-espresso/50">
              {restaurants.length} {restaurants.length === 1 ? "venue" : "venues"} · 30 Oct — 10 Nov
            </p>
          </Reveal>
        </div>

        {restaurants.length === 0 ? (
          <p className="mt-20 border-t border-espresso/15 pt-10 font-display text-2xl italic text-espresso/70">
            Participating restaurants will be announced soon.
          </p>
        ) : (
          <ul className="mt-20 grid grid-cols-1 gap-y-16 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-20 sm:pb-24 lg:mt-28 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-24 lg:pb-48">
            {restaurants.map((r, i) => (
              <Reveal
                as="li"
                key={r.id}
                delay={(i % 2) * 0.12}
                // The right-hand column rides lower; translate keeps grid rows intact.
                className={cn(i % 2 === 0 ? "lg:col-span-6" : "sm:translate-y-24 lg:col-span-5 lg:col-start-8 lg:translate-y-48")}
              >
                <RestaurantCard restaurant={r} index={i} />
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function RestaurantCard({ restaurant: r, index }: { restaurant: PublicRestaurant; index: number }) {
  return (
    <Link href={`/vote?restaurant=${r.slug}`} className="group block focus-visible:outline-offset-8" aria-label={`Vote for ${r.name}`}>
      <div className="relative aspect-[4/5] overflow-hidden bg-stone">
        {r.imageUrl ? (
          <SmartImage
            src={r.imageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 45vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-[50%_78%] transition-transform duration-[1.6s] ease-[var(--ease-editorial)] group-hover:scale-[1.06]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-espresso">
            <span className="font-display text-7xl italic text-ivory/20">{r.name.charAt(0)}</span>
          </div>
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-espresso-deep/55 via-transparent to-espresso-deep/10" />
        <span className="eyebrow absolute left-5 top-5 text-ivory/90">N° {String(index + 1).padStart(2, "0")}</span>
        <span className="eyebrow absolute bottom-5 left-5 flex items-center gap-3 text-ivory">
          <span aria-hidden className="tricolore inline-block h-[2px] w-0 transition-[width] duration-700 ease-[var(--ease-editorial)] group-hover:w-10" />
          Vote for this Tiramisù
        </span>
      </div>

      <div className="mt-6 flex items-start justify-between gap-6">
        <div>
          <h3 className="font-display text-[clamp(2rem,3.2vw,2.75rem)] leading-[1.05] tracking-[-0.015em] text-espresso">
            {r.name}
          </h3>
          <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-charcoal/65">
            {r.description || "Participating restaurant · Mogadishu"}
          </p>
        </div>
        <span
          aria-hidden
          className="relative mt-1 grid size-14 shrink-0 place-items-center overflow-hidden rounded-full border border-espresso/20 text-espresso transition-colors duration-500 group-hover:border-green group-hover:text-ivory"
        >
          <span className="absolute inset-0 scale-0 rounded-full bg-green transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:scale-100" />
          <ArrowUpRight className="relative size-5 transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:rotate-45" />
        </span>
      </div>
    </Link>
  );
}
