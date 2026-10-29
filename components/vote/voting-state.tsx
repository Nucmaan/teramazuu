import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { Cta } from "@/components/site/cta";
import heroImage from "@/public/images/photo/hero-coupe.jpg";

/** Shown only while an administrator has paused voting. */
export function VotingState() {
  return (
    <div className="min-h-svh bg-ivory lg:grid lg:grid-cols-12">
      <aside className="relative isolate h-[34svh] overflow-hidden bg-espresso-deep lg:sticky lg:top-0 lg:col-span-5 lg:h-svh">
        <div aria-hidden className="absolute inset-0 -z-10">
          <Image
          src={heroImage}
          alt=""
          fill
          preload
          placeholder="blur"
          sizes="(min-width: 1024px) 42vw, 100vw"
          className="object-cover object-[50%_60%] opacity-80"
        />
        </div>
        <div aria-hidden className="grain absolute inset-0" />
        <div className="relative flex items-center justify-between px-[var(--gutter)] pt-5 text-ivory lg:pt-10">
          <Link href="/" className="font-display text-xl lg:text-2xl">
            Taste<span className="text-green">,</span> Click <span className="italic text-red">&amp;</span> Vote
          </Link>
          <Link href="/" aria-label="Return home" className="-mr-2 grid size-11 place-items-center text-ivory/80 hover:text-ivory">
            <X className="size-5" />
          </Link>
        </div>
      </aside>

      <section className="flex flex-col justify-center px-[var(--gutter)] py-14 lg:col-span-7 lg:min-h-svh lg:px-[clamp(3rem,6vw,7rem)]">
        <p className="eyebrow flex items-center gap-3 text-espresso/60">
          <span aria-hidden className="tricolore inline-block h-[2px] w-8" />
          A short pause
        </p>
        <h1 className="display mt-8 text-[clamp(3.25rem,7vw,6.5rem)] uppercase leading-[0.9] text-espresso">
          Voting Is <span className="block italic text-red">Paused.</span>
        </h1>
        <p className="mt-8 max-w-lg text-[1.0625rem] leading-relaxed text-charcoal/75">
          Voting is temporarily paused by the organisers. Please check back shortly.
        </p>

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Cta href="/#restaurants" variant="espresso" size="md">
            Discover the restaurants
          </Cta>
        </div>
      </section>
    </div>
  );
}
