"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { BrandLockup } from "@/components/site/brand";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function SiteNav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    // Step out of the way while reading downwards; return on any upward intent.
    setHidden(y > 640 && y > prev + 4);
    if (y < prev - 4) setHidden(false);
  });

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: hidden ? "-110%" : 0, opacity: 1 }}
      transition={{ duration: 0.6, ease }}
      className={cn(
        "tone-green fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
        scrolled
          ? "border-b border-white/15 bg-[#00592c]/90 backdrop-blur-md backdrop-saturate-150"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav aria-label="Primary" className="shell flex h-[4.5rem] items-center justify-between gap-6 lg:h-20">
        <BrandLockup />
        <VoteButton />
      </nav>
    </motion.header>
  );
}

function VoteButton() {
  return (
    <Link
      href="/vote"
      className="group relative inline-flex h-11 shrink-0 items-center gap-3 overflow-hidden bg-[#cd212a] pl-5 pr-4 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-white"
    >
      <span
        aria-hidden
        className="absolute inset-0 origin-bottom scale-y-0 bg-[#8f141b] transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:scale-y-100"
      />
      <span className="relative">Vote Now</span>
      <ArrowUpRight
        aria-hidden
        className="relative size-4 transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
      <span aria-hidden className="tricolore absolute inset-x-0 bottom-0 h-[2px]" />
    </Link>
  );
}
