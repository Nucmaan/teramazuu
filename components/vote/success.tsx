"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Check, Share2 } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;
const R = 46;
const C = 2 * Math.PI * R;

/** Tricolore ring drawn in three arcs, closing on a check mark. */
function TricoloreSeal() {
  const arcs = [
    { color: "var(--color-green)", offset: 0 },
    { color: "var(--color-stone-line)", offset: 1 },
    { color: "var(--color-red)", offset: 2 },
  ];
  return (
    <svg viewBox="0 0 120 120" className="size-28 -rotate-90 sm:size-32" aria-hidden>
      {arcs.map((a, i) => (
        <motion.circle
          key={i}
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke={a.color}
          strokeWidth="3"
          strokeDasharray={`${C / 3 - 4} ${C}`}
          initial={{ strokeDashoffset: C / 3 }}
          animate={{ strokeDashoffset: -(C / 3) * a.offset }}
          transition={{ duration: 0.9, ease, delay: 0.15 + i * 0.18 }}
          style={{ opacity: 1 }}
        />
      ))}
      <motion.path
        d="M42 61 l12 12 l25 -27"
        fill="none"
        stroke="var(--color-espresso)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="rotate(90 60 60)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease, delay: 0.85 }}
      />
    </svg>
  );
}

export function VoteSuccess({ restaurantName, test }: { restaurantName?: string; test: boolean }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => headingRef.current?.focus(), []);

  async function share() {
    const url = window.location.origin;
    const data = {
      title: "Taste, Click & Vote — #SCIM2026",
      text: "I just voted for my favourite Tiramisù in Mogadishu. Taste, click & vote! #SCIM2026 #cucinaitaliana",
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(`${data.text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      /* user dismissed the share sheet */
    }
  }

  return (
    <div className="flex flex-col items-start">
      <TricoloreSeal />
      <motion.p
        className="eyebrow mt-10 text-espresso/60"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease, delay: 1 }}
      >
        {test ? "Test vote recorded — excluded from results" : "Vote received"}
      </motion.p>
      <h2 ref={headingRef} tabIndex={-1} className="display mt-5 text-[clamp(3.25rem,7vw,6rem)] uppercase leading-[0.9] text-espresso outline-none">
        <span className="block overflow-hidden">
          <motion.span className="block" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 1, ease, delay: 1.05 }}>
            Grazie
          </motion.span>
        </span>{" "}
        <span className="block overflow-hidden">
          <motion.span className="block italic text-green-deep" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 1, ease, delay: 1.15 }}>
            mille!
          </motion.span>
        </span>
      </h2>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease, delay: 1.35 }}>
        <p className="mt-8 font-display text-[1.625rem] leading-tight text-espresso">Your Vote Has Been Submitted.</p>
        <p className="mt-4 max-w-md text-[1.0625rem] leading-relaxed text-charcoal/75">
          Thank you for celebrating the Week of Italian Cuisine in the World 2026
          {restaurantName ? (
            <>
              {" "}
              — and for sharing your verdict on <span className="text-espresso">{restaurantName}</span>
            </>
          ) : null}
          .
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-14 items-center justify-center bg-espresso px-7 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-ivory transition-colors hover:bg-green"
          >
            Return home
          </Link>
          <button
            type="button"
            onClick={share}
            className="inline-flex h-14 items-center justify-center gap-3 border border-espresso/25 px-7 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-espresso transition-colors hover:border-espresso"
          >
            {copied ? <Check aria-hidden className="size-4 text-green" /> : <Share2 aria-hidden className="size-4" />}
            {copied ? "Link copied" : "Share campaign"}
          </button>
        </div>
        <p className="sr-only" aria-live="polite">
          {copied ? "Link copied to clipboard" : ""}
        </p>
      </motion.div>
    </div>
  );
}
