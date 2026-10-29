import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Typographic campaign lockup, echoing the poster's Embassy signature
 * (name + tricolore rule). Official vector logos for the Embassy of Italy and
 * the Italian Trade Agency must be supplied by the organiser — see README.
 */
export function BrandLockup({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Taste, Click & Vote — home"
      className={cn("group inline-flex items-center gap-4", tone === "light" ? "text-ivory" : "text-espresso", className)}
    >
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.375rem] tracking-[-0.01em] sm:text-2xl">
          Taste<span className="text-green">,</span> Click <span className="italic text-red">&amp;</span> Vote
        </span>
        <span aria-hidden className="tricolore mt-2 block h-[2px] w-full origin-left transition-transform duration-700 ease-[var(--ease-editorial)] group-hover:scale-x-[0.6]" />
        <span className="eyebrow mt-2 text-[0.5625rem] tracking-[0.28em] opacity-70">Embassy of Italy · Mogadishu</span>
      </span>
    </Link>
  );
}
