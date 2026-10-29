"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { BrandLockup } from "@/components/site/brand";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#experience", label: "The Experience" },
  { href: "/#restaurants", label: "Restaurants" },
  { href: "/#about", label: "About" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function SiteNav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    // Step out of the way while reading downwards; return on any upward intent.
    setHidden(y > 640 && y > prev + 4);
    if (y < prev - 4) setHidden(false);
  });

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: hidden && !open ? "-110%" : 0, opacity: 1 }}
        transition={{ duration: 0.6, ease }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled && !open
            ? "border-b border-espresso/10 bg-ivory/88 backdrop-blur-md backdrop-saturate-150"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav aria-label="Primary" className="shell flex h-[4.5rem] items-center justify-between gap-6 lg:h-20">
          <BrandLockup tone={open ? "light" : "dark"} className="relative z-[60]" />

          <ul className="hidden items-center gap-9 lg:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline pb-1 text-[0.8125rem] font-medium tracking-[0.02em] text-espresso">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <VoteButton />
            </li>
          </ul>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className={cn(
              "relative z-[60] -mr-2 flex h-12 w-12 items-center justify-center lg:hidden",
              open ? "text-ivory" : "text-espresso",
            )}
          >
            <span className="relative block h-3 w-7">
              <span
                className={cn(
                  "absolute left-0 top-0 h-px w-full bg-current transition-transform duration-500 ease-[var(--ease-editorial)]",
                  open && "translate-y-1.5 rotate-45",
                )}
              />
              <span
                className={cn(
                  "absolute bottom-0 right-0 h-px bg-current transition-all duration-500 ease-[var(--ease-editorial)]",
                  open ? "w-full -translate-y-1.5 -rotate-45" : "w-4",
                )}
              />
            </span>
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>{open && <MobileMenu onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}

function VoteButton() {
  return (
    <Link
      href="/vote"
      className="group relative inline-flex h-11 items-center gap-3 overflow-hidden bg-espresso pl-5 pr-4 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-ivory"
    >
      <span
        aria-hidden
        className="absolute inset-0 origin-bottom scale-y-0 bg-green transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:scale-y-100"
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

function MobileMenu({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Keep focus inside the open menu.
      if (e.key === "Tab" && panelRef.current) {
        // The header's close toggle sits above the panel; keep it in the loop.
        const toggle = document.querySelector<HTMLElement>('[aria-controls="mobile-menu"]');
        const items = [...panelRef.current.querySelectorAll<HTMLElement>("a, button"), ...(toggle ? [toggle] : [])];
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const all = [...LINKS, { href: "/vote", label: "Vote Now" }];

  return (
    <motion.div
      id="mobile-menu"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      animate={{ clipPath: "inset(0 0 0% 0)" }}
      exit={{ clipPath: "inset(0 0 100% 0)" }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-40 flex flex-col bg-espresso-deep text-ivory lg:hidden"
    >
      <div className="shell flex flex-1 flex-col justify-between pb-10 pt-28">
        <ul className="space-y-1">
          {all.map((l, i) => (
            <motion.li
              key={l.href}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 + i * 0.06, duration: 0.7, ease }}
              className="border-b border-ivory/10"
            >
              <Link
                href={l.href}
                onClick={onClose}
                className="flex items-baseline gap-5 py-4 font-display text-[2.375rem] leading-none tracking-[-0.02em]"
              >
                <span className="eyebrow w-6 text-gold">{String(i + 1).padStart(2, "0")}</span>
                <span className={cn(l.href === "/vote" && "italic text-green")}>{l.label}</span>
              </Link>
            </motion.li>
          ))}
        </ul>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="space-y-5"
        >
          <span aria-hidden className="tricolore block w-16" />
          <p className="eyebrow text-ivory/70">30 October — 10 November 2026 · Mogadishu</p>
          <p className="text-sm text-ivory/50">#SCIM2026 · Embassy of Italy in Mogadishu</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
