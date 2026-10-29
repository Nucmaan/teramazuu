import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import forkSpoon from "@/public/images/images-4.png";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/#experience", label: "The Experience" },
  { href: "/#restaurants", label: "Restaurants" },
  { href: "/#about", label: "About" },
  { href: "/vote", label: "Vote Now" },
];

const TAGS = ["#SCIM2026", "#cucinaitaliana", "#DiplomaziadellaCrescita"];

export function SiteFooter() {
  return (
    <footer className="ground-green relative">
      <div className="shell pb-10 pt-24 lg:pt-32">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-8">
          <div className="flex items-start gap-6 lg:col-span-6">
            <Image
              src={forkSpoon}
              alt="Week of the Italian Cuisine in the World — campaign graphic"
              sizes="120px"
              className="h-auto w-20 shrink-0 bg-white p-2 sm:w-28"
            />
            <p className="display text-[clamp(2.25rem,4.4vw,4rem)] leading-[0.98] text-espresso">
              Week of Italian Cuisine <span className="italic text-espresso/55">in the World</span>{" "}
              <span className="text-red">2026</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-6">
            <div>
              <h2 className="eyebrow text-espresso/50">Organised by</h2>
              <p className="mt-5 font-display text-lg leading-snug">Embassy of Italy in Mogadishu</p>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/65">
                With the Italian Trade Agency
                <br />
                30 October — 10 November 2026
                <br />
                Mogadishu, Somalia
              </p>
            </div>
            <nav aria-label="Footer">
              <h2 className="eyebrow text-espresso/50">Navigate</h2>
              <ul className="mt-4 space-y-0.5">
                {NAV.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link-underline inline-block py-1.5 text-[0.95rem] text-charcoal/80 hover:text-espresso">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="col-span-2 sm:col-span-1">
              <h2 className="eyebrow text-espresso/50">Follow</h2>
              <a
                href="https://x.com/ItalyInSomalia"
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-5 inline-flex items-center gap-2 font-display text-lg"
              >
                <span className="link-underline">@ItalyInSomalia</span>
                <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                <span className="sr-only">on X (opens in a new tab)</span>
              </a>
              <ul className="mt-4 space-y-1.5 text-sm text-charcoal/65">
                {TAGS.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-espresso/15 pt-8 text-[0.8125rem] text-charcoal/60 sm:flex-row sm:items-center sm:justify-between lg:mt-28">
          <p>Taste, Click &amp; Vote · Week of Italian Cuisine in the World 2026</p>
          <p>Embassy of Italy in Mogadishu</p>
        </div>
      </div>
      {/* Poster-style tricolore base */}
      <div aria-hidden className="grid h-2 grid-cols-[1fr_1fr_1fr] gap-0">
        <span className="bg-[#008c45]" />
        <span className="bg-white" />
        <span className="bg-[#cd212a]" />
      </div>
    </footer>
  );
}
