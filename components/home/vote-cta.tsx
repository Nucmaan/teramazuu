import Image from "next/image";
import { Cta } from "@/components/site/cta";
import { LineReveal, Reveal } from "@/components/site/reveal";
import ctaImage from "@/public/images/photo/cta-dark.jpg";

export function VoteCta() {
  return (
    <section aria-labelledby="cta-title" className="ground-red relative isolate overflow-hidden">
      <Image
        src={ctaImage}
        alt=""
        fill
        placeholder="blur"
        sizes="100vw"
        className="-z-10 object-cover object-[70%_50%] opacity-80"
      />
      <div aria-hidden className="grain absolute inset-0 -z-10" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(205,33,42,0.96)_0%,rgba(205,33,42,0.82)_42%,rgba(205,33,42,0.2)_100%)]"
      />

      <div className="shell flex min-h-[44rem] flex-col justify-center py-28 lg:min-h-[52rem]">
        <p className="eyebrow flex items-center gap-3 text-ivory/70">
          <span aria-hidden className="tricolore inline-block h-[2px] w-8" />
          The voting experience
        </p>
        <LineReveal
          id="cta-title"
          label="The best Tiramisù? You decide."
          className="display mt-10 max-w-[14ch] text-[length:var(--text-display-xl)] uppercase leading-[0.9]"
          lines={[
            "The best",
            <span key="t" className="italic normal-case">
              Tiramisù?
            </span>,
            <span key="y" className="text-red">
              You decide.
            </span>,
          ]}
        />
        <Reveal delay={0.2} className="mt-12 max-w-md">
          <p className="text-[1.0625rem] leading-relaxed text-ivory/75">
            Your taste matters. Celebrate the flavors of Italy and help recognize your favorite Tiramisù experience.
          </p>
          <Cta href="/vote" className="mt-10 min-w-[15rem]">
            Vote now
          </Cta>
        </Reveal>
      </div>
    </section>
  );
}
