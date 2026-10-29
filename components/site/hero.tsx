"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { Cta } from "@/components/site/cta";
import { LineReveal } from "@/components/site/reveal";
import { Seal } from "@/components/site/seal";
import heroImage from "@/public/images/photo/hero-coupe.jpg";

const ease = [0.22, 1, 0.36, 1] as const;
// The opening curtain is deliberately brief: voting must never wait on it.
const CURTAIN = 0.85;

export function Hero({ intro }: { intro: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);
  const t = (d: number) => (reduce ? 0 : CURTAIN + d);

  return (
    <section ref={ref} aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-ivory">
      {/* Opening curtain */}
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-espresso-deep"
          initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: CURTAIN - 0.35 }}
        >
          <motion.span
            className="tricolore block w-40 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, ease }}
          />
        </motion.div>
      )}

      <div className="relative mx-auto grid min-h-svh max-w-[90rem] grid-cols-1 lg:grid-cols-12">
        {/* Copy column */}
        <motion.div
          style={{ y: reduce ? 0 : textY }}
          className="relative z-10 flex flex-col justify-between px-[var(--gutter)] pb-10 pt-28 lg:col-span-7 lg:pb-14 lg:pt-36"
        >
          <motion.p
            className="eyebrow flex items-center gap-3 text-espresso/80"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: t(0.05) }}
          >
            <span aria-hidden className="tricolore inline-block h-[2px] w-8" />
            The Week of Italian Cuisine in the World
          </motion.p>

          <LineReveal
            as="h1"
            animateOnMount
            id="hero-title"
            label="Taste. Click. Vote."
            delay={t(0.1)}
            stagger={0.11}
            className="display mt-8 text-[clamp(4.25rem,10.4vw,10rem)] uppercase leading-[0.86] text-espresso lg:mt-0"
            lines={[
              <span key="t">
                Taste<span className="text-green">.</span>
              </span>,
              <span key="c" className="block pl-[0.55em] italic">
                Click<span className="text-gold">.</span>
              </span>,
              <span key="v" className="block pl-[1.4em] text-red">
                Vote.
              </span>,
            ]}
          />

          <div className="mt-10 grid gap-10 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease, delay: t(0.55) }}
            >
              <p className="max-w-[30rem] text-[1.0625rem] leading-[1.65] text-charcoal/80">{intro}</p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
                <Cta href="/vote" className="sm:min-w-[15.5rem]">
                  Cast your vote
                </Cta>
                <Link
                  href="#about"
                  className="group inline-flex h-12 items-center gap-3 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-espresso"
                >
                  <span className="link-underline pb-1">Explore the experience</span>
                  <ArrowDown aria-hidden className="size-4 transition-transform duration-500 group-hover:translate-y-1" />
                </Link>
              </div>
            </motion.div>

            <motion.dl
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: t(0.75) }}
              className="hidden border-l border-espresso/15 pl-6 lg:block"
            >
              <dt className="eyebrow text-espresso/60">Mogadishu · 2026</dt>
              <dd className="mt-3 font-display text-[1.375rem] leading-tight text-espresso">
                30 October
                <br />
                <span className="italic text-espresso/60">to</span> 10 November
              </dd>
            </motion.dl>
          </div>
        </motion.div>

        {/* Image column — a framed "magazine cover" */}
        <div className="relative px-[var(--gutter)] pb-6 lg:col-span-5 lg:py-0 lg:pl-0 lg:pr-[var(--gutter)] lg:pt-28">
          <motion.figure
            className="relative h-[min(118vw,40rem)] overflow-hidden bg-espresso-deep lg:h-[calc(100svh-9.5rem)] lg:min-h-[34rem]"
            initial={reduce ? false : { clipPath: "inset(12% 8% 12% 8%)", opacity: 0 }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1], delay: t(0) }}
          >
            <motion.div
              className="absolute inset-[-6%_0]"
              style={{ y: reduce ? 0 : imageY }}
              initial={reduce ? false : { scale: 1.25 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2.2, ease, delay: t(0) }}
            >
              <Image
                src={heroImage}
                alt="Tiramisù served in a fluted glass coupe, dusted with cocoa and crowned with a savoiardi biscuit"
                fill
                preload
                placeholder="blur"
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover object-[50%_62%]"
              />
            </motion.div>
            <div aria-hidden className="grain absolute inset-0" />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-espresso-deep/70 to-transparent" />
            <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-ivory sm:p-6">
              <span className="eyebrow text-ivory/85">Fig. 01 — Tiramisù</span>
              <span className="font-display text-sm italic text-ivory/75">Treviso, Veneto</span>
            </figcaption>
          </motion.figure>

          <motion.div
            className="absolute -left-[4.5rem] top-[22%] z-20 hidden lg:block xl:-left-20"
            initial={{ opacity: 0, scale: 0.85, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease, delay: t(0.9) }}
          >
            <Seal
              id="hero-seal"
              className="size-36 shadow-[0_1px_0_rgba(48,34,28,0.06)] xl:size-40"
              text="Week of Italian Cuisine · #SCIM2026 · "
              center={
                <span className="flex flex-col items-center leading-none text-espresso">
                  <span className="font-display text-[2rem] italic">26</span>
                  <span aria-hidden className="tricolore mt-1.5 block h-[2px] w-7" />
                </span>
              }
            />
          </motion.div>
        </div>

        {/* Mobile-only date line */}
        <div className="flex items-center justify-between px-[var(--gutter)] pb-10 lg:hidden">
          <p className="eyebrow text-espresso/70">30 Oct — 10 Nov 2026</p>
          <p className="eyebrow text-espresso/50">Mogadishu</p>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        aria-hidden
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 lg:left-[var(--gutter)] lg:flex lg:translate-x-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: t(1.1), duration: 0.8 }}
      >
        <span className="relative block h-12 w-px overflow-hidden bg-espresso/15">
          <span className="absolute inset-0 animate-scroll-cue bg-espresso" />
        </span>
      </motion.div>
    </section>
  );
}
