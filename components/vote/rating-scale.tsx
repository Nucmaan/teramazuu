"use client";

import { useId, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RATING_LABELS } from "@/lib/validation";
import { cn } from "@/lib/utils";

const SCORES = [1, 2, 3, 4, 5] as const;

// Lower scores read warm/red, the middle is neutral gold, positive scores are
// Italian green — so the scale stays legible beyond colour alone (labels too).
const TONE: Record<number, { fill: string; text: string }> = {
  1: { fill: "fill-red text-red", text: "text-red-deep" },
  2: { fill: "fill-red/70 text-red/80", text: "text-red-deep" },
  3: { fill: "fill-gold text-gold", text: "text-cocoa" },
  4: { fill: "fill-green text-green", text: "text-green-deep" },
  5: { fill: "fill-green text-green", text: "text-green-deep" },
};

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        d="M12 2.8l2.75 5.95 6.5.72-4.85 4.4 1.36 6.4L12 17.02l-5.76 3.25 1.36-6.4-4.85-4.4 6.5-.72L12 2.8z"
        strokeWidth="1.2"
        stroke="currentColor"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RatingScale({
  name,
  title,
  question,
  value,
  onChange,
  error,
  index,
}: {
  name: string;
  title: string;
  question: string;
  value: number | undefined;
  onChange: (v: number) => void;
  error?: string;
  index: number;
}) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value ?? 0;
  const tone = shown ? TONE[shown] : null;

  return (
    <fieldset
      className="border-t border-espresso/15 pt-7"
      aria-describedby={error ? `${id}-error` : undefined}
      aria-invalid={error ? true : undefined}
    >
      <legend className="float-left w-full">
        <span className="flex items-baseline gap-4">
          <span className="font-display text-sm italic text-gold">{String(index).padStart(2, "0")}</span>
          <span className="eyebrow text-espresso">{title}</span>
        </span>
        <span className="mt-2 block text-[1.0625rem] leading-snug text-charcoal/75">{question}</span>
      </legend>

      <div className="clear-both pt-5">
        <div className="flex items-center justify-between gap-1 sm:justify-start sm:gap-2" onMouseLeave={() => setHover(null)} onKeyDown={() => setHover(null)}>
          {SCORES.map((score) => {
            const active = shown >= score;
            const inputId = `${id}-${score}`;
            return (
              <label
                key={score}
                htmlFor={inputId}
                onMouseEnter={() => setHover(score)}
                className="group relative flex min-h-14 min-w-14 flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 py-1 sm:flex-none"
              >
                <input
                  id={inputId}
                  type="radio"
                  name={name}
                  value={score}
                  checked={value === score}
                  onChange={() => onChange(score)}
                  className="peer sr-only"
                />
                <motion.span
                  className="block rounded-full p-1 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-green"
                  animate={value === score ? { scale: [1, 1.28, 1] } : { scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Star
                    className={cn(
                      "size-10 transition-colors duration-300 sm:size-11",
                      active && tone ? tone.fill : "fill-transparent text-espresso/30 group-hover:text-espresso/60",
                    )}
                  />
                </motion.span>
                <span
                  className={cn(
                    "text-[0.6875rem] font-semibold tabular-nums transition-colors",
                    value === score ? "text-espresso" : "text-espresso/45",
                  )}
                >
                  {score}
                  <span className="sr-only"> — {RATING_LABELS[score]}</span>
                </span>
              </label>
            );
          })}
        </div>

        <p className="sr-only" aria-live="polite">
          {value ? `${title}: ${value} — ${RATING_LABELS[value as keyof typeof RATING_LABELS]}` : ""}
        </p>
        <div className="mt-3 flex h-7 items-center" aria-hidden>
          <AnimatePresence mode="wait" initial={false}>
            {shown ? (
              <motion.p
                key={shown}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className={cn("font-display text-xl italic", tone?.text, hover && hover !== value && "opacity-60")}
              >
                {RATING_LABELS[shown as keyof typeof RATING_LABELS]}
              </motion.p>
            ) : (
              <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-charcoal/45">
                Choose from 1 (Awful) to 5 (Fantastic)
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        {error && (
          <p id={`${id}-error`} role="alert" className="mt-1 text-sm font-medium text-red-deep">
            {error}
          </p>
        )}
      </div>
    </fieldset>
  );
}
