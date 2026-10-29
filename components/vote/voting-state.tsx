import Link from "next/link";
import { X } from "lucide-react";
import { Cta } from "@/components/site/cta";

/** Shown only while an administrator has paused voting. */
export function VotingState() {
  return (
    <div className="min-h-svh bg-ivory">
      <header className="bg-[#cd212a] text-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-[var(--gutter)]">
          <Link href="/" className="font-display text-xl tracking-[-0.01em]">
            Taste<span className="text-[#c8f5d9]">,</span> Click <span className="italic text-[#c8f5d9]">&amp;</span> Vote
          </Link>
          <Link href="/" aria-label="Return home" className="-mr-2 grid size-11 place-items-center text-white/80 hover:text-white">
            <X className="size-5" />
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-[var(--gutter)] py-16 lg:py-24">
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
