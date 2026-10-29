import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import type { VotingStatus } from "@/lib/campaign";
import { formatCampaignDate, formatCampaignDateTime } from "@/lib/time";
import { Cta } from "@/components/site/cta";
import { Countdown } from "@/components/vote/countdown";
import heroImage from "@/public/images/photo/hero-coupe.jpg";

const COPY: Record<Exclude<VotingStatus, "open">, { eyebrow: string; title: [string, string]; body: string }> = {
  upcoming: {
    eyebrow: "Taste, Click & Vote",
    title: ["Voting Opens", "Soon."],
    body: "The ballot opens with the Week of Italian Cuisine in the World. Until then, discover the participating restaurants — and save room for Tiramisù.",
  },
  closed: {
    eyebrow: "Thank you, Mogadishu",
    title: ["Voting Has", "Closed."],
    body: "Thank you to everyone who tasted, clicked and voted to celebrate Italian cuisine in Mogadishu.",
  },
  paused: {
    eyebrow: "A short pause",
    title: ["Voting Is", "Paused."],
    body: "Voting is temporarily paused by the organisers. Please check back shortly.",
  },
};

export function VotingState({
  status,
  startDate,
  endDate,
  resultsPublic,
}: {
  status: Exclude<VotingStatus, "open">;
  startDate: Date;
  endDate: Date;
  resultsPublic: boolean;
}) {
  const c = COPY[status];
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
          {c.eyebrow}
        </p>
        <h1 className="display mt-8 text-[clamp(3.25rem,7vw,6.5rem)] uppercase leading-[0.9] text-espresso">
          {c.title[0]} <span className="block italic text-red">{c.title[1]}</span>
        </h1>
        <p className="mt-8 max-w-lg text-[1.0625rem] leading-relaxed text-charcoal/75">{c.body}</p>

        {status === "upcoming" && (
          <div className="mt-12 max-w-xl">
            <Countdown target={startDate.toISOString()} />
            <p className="mt-4 text-sm text-charcoal/60">
              Opens {formatCampaignDateTime(startDate)} (Mogadishu time) · closes {formatCampaignDate(endDate)}
            </p>
          </div>
        )}

        <div className="mt-12 flex flex-col gap-3 sm:flex-row">
          <Cta href="/#restaurants" variant="espresso" size="md">
            Discover the restaurants
          </Cta>
          {status === "closed" && resultsPublic && (
            <Cta href="/results" variant="green" size="md">
              See the results
            </Cta>
          )}
        </div>
      </section>
    </div>
  );
}
