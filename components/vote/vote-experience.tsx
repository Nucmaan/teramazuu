"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Loader2, Pencil, X } from "lucide-react";
import type { PublicRestaurant } from "@/lib/campaign";
import { RATING_LABELS, voteSchema, type VoteInput } from "@/lib/validation";
import { submitVote } from "@/app/vote/actions";
import { RatingScale } from "@/components/vote/rating-scale";
import { Turnstile } from "@/components/vote/turnstile";
import { VoteSuccess } from "@/components/vote/success";
import { SmartImage } from "@/components/site/smart-image";
import { cn } from "@/lib/utils";
import heroImage from "@/public/images/photo/hero-coupe.jpg";
import classicImage from "@/public/images/photo/classic.jpg";
import creativeImage from "@/public/images/photo/creative.jpg";

const STEPS = [
  { key: "restaurant", label: "Restaurant", fields: ["restaurant"] },
  { key: "type", label: "Tiramisù", fields: ["tiramisuType"] },
  { key: "rating", label: "Rating", fields: ["presentationRating", "tasteRating", "overallRating"] },
  { key: "review", label: "Review", fields: [] },
] as const;

const PANEL_COPY = [
  "Every great Tiramisù begins at a table.",
  "Faithful to tradition, or a bold new twist?",
  "Layer by layer, your verdict.",
  "One last look before it counts.",
  "Grazie. Your taste has spoken.",
];

const TYPES = [
  {
    value: "CLASSIC" as const,
    title: "Classic Tiramisù",
    body: "Traditional Italian Tiramisù.",
    image: classicImage,
    alt: "A square of classic layered Tiramisù dusted with cocoa",
  },
  {
    value: "CREATIVE" as const,
    title: "Creative Tiramisù",
    body: "A creative interpretation of the Italian classic.",
    image: creativeImage,
    alt: "A Tiramisù plated with orange, mint, chocolate and pomegranate",
  },
];

const RATINGS = [
  { name: "presentationRating" as const, title: "Presentation", question: "How do you rate the presentation of your Tiramisù?" },
  { name: "tasteRating" as const, title: "Taste", question: "How do you rate the taste of your Tiramisù?" },
  { name: "overallRating" as const, title: "Overall experience", question: "How do you rate your overall Tiramisù experience?" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function VoteExperience({
  restaurants,
  initialRestaurant,
  turnstileSiteKey,
  preview,
}: {
  restaurants: PublicRestaurant[];
  initialRestaurant?: string;
  turnstileSiteKey?: string;
  preview: boolean;
}) {
  const preselected = restaurants.some((r) => r.slug === initialRestaurant) ? initialRestaurant : undefined;
  const reduce = useReducedMotion();

  const {
    control,
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<VoteInput>({
    resolver: zodResolver(voteSchema),
    defaultValues: { restaurant: preselected },
    mode: "onTouched",
  });

  // QR visitors arrive with the restaurant chosen — start them on step two.
  const [step, setStep] = useState(preselected ? 1 : 0);
  const [direction, setDirection] = useState(1);
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<{ test: boolean } | null>(null);
  const [pending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shownStep = useRef(step);
  const honeypot = useRef<HTMLInputElement>(null);

  const values = useWatch({ control });
  const restaurant = restaurants.find((r) => r.slug === values.restaurant);
  const done = result !== null;
  const panelIndex = done ? 4 : step;

  useEffect(() => {
    // Only move focus on an actual step change (safe under StrictMode re-runs).
    if (shownStep.current === step) return;
    shownStep.current = step;
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [step, reduce]);

  const go = useCallback((to: number) => {
    setDirection(to > step ? 1 : -1);
    setServerError(null);
    setStep(to);
  }, [step]);

  async function next() {
    const fields = STEPS[step].fields as unknown as (keyof VoteInput)[];
    if (fields.length && !(await trigger(fields, { shouldFocus: true }))) return;
    go(step + 1);
  }

  function submit() {
    setServerError(null);
    startTransition(async () => {
      const valid = await trigger();
      if (!valid) {
        setServerError("Some answers are missing. Please review your vote.");
        return;
      }
      const res = await submitVote(
        { ...getValues(), turnstileToken: token, website: honeypot.current?.value ?? "" },
        { preview },
      );
      if (res.ok) {
        setResult({ test: res.test });
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      } else {
        setServerError(res.message);
        if (res.code === "bot") setResetKey((k) => k + 1);
        if (res.code === "restaurant") go(0);
      }
    });
  }

  const needsBotCheck = Boolean(turnstileSiteKey) && !preview;
  const canSubmit = !pending && (!needsBotCheck || token.length > 0);

  return (
    <div className="min-h-svh bg-ivory lg:grid lg:grid-cols-12">
      {/* ── Left: photographic panel ───────────────────────────── */}
      <aside className="relative isolate overflow-hidden bg-[#cd212a] text-ivory lg:sticky lg:top-0 lg:col-span-5 lg:h-svh">
        <div aria-hidden className="absolute inset-0 -z-10">
          <Image
          src={heroImage}
          alt=""
          fill
          preload
          placeholder="blur"
          sizes="(min-width: 1024px) 42vw, 100vw"
          className="object-cover object-[50%_60%] opacity-70 lg:opacity-80"
        />
        </div>
        <div aria-hidden className="grain absolute inset-0 -z-10" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-[#8f141b]/80 via-[#cd212a]/55 to-[#8f141b]/90" />

        <div className="flex h-full flex-col justify-between px-[var(--gutter)] pb-6 pt-5 lg:py-10">
          <div className="flex items-center justify-between">
            <Link href="/" className="font-display text-xl tracking-[-0.01em] lg:text-2xl">
              Taste<span className="text-[#c8f5d9]">,</span> Click <span className="italic text-[#c8f5d9]">&amp;</span> Vote
            </Link>
            <Link
              href="/"
              aria-label="Leave voting and return home"
              className="-mr-2 grid size-11 place-items-center text-ivory/80 transition-colors hover:text-ivory"
            >
              <X className="size-5" />
            </Link>
          </div>

          <div className="mt-14 hidden lg:block">
            <p className="eyebrow flex items-center gap-3 text-ivory/70">
              <span aria-hidden className="tricolore inline-block h-[2px] w-8" />
              #SCIM2026 · Mogadishu
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={panelIndex}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.6, ease }}
                className="display mt-8 max-w-[13ch] text-[clamp(2.5rem,3.6vw,3.75rem)] leading-[1.02]"
              >
                {PANEL_COPY[panelIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress — compact on mobile, editorial on desktop */}
          <div className={cn("mt-16 lg:mt-0", done && "invisible")}>
            <div className="flex items-end justify-between gap-6">
              <p className="font-display leading-none" aria-hidden>
                <span className="text-[3.25rem] lg:text-[5rem]">{String(Math.min(step + 1, 4)).padStart(2, "0")}</span>
                <span className="ml-2 text-xl italic text-ivory/50 lg:text-2xl">/ 04</span>
              </p>
              <p className="eyebrow pb-2 text-ivory/70">{STEPS[Math.min(step, 3)].label}</p>
            </div>
            <ol className="mt-5 grid grid-cols-4 gap-2" aria-label="Voting progress">
              {STEPS.map((s, i) => (
                <li key={s.key} className="relative h-[3px] overflow-hidden bg-ivory/20">
                  <span className="sr-only">
                    Step {i + 1}, {s.label}: {i < step ? "complete" : i === step ? "current" : "upcoming"}
                  </span>
                  <motion.span
                    aria-hidden
                    className={cn("absolute inset-0 origin-left", i === 0 ? "bg-green" : i === 3 ? "bg-white" : "bg-ivory")}
                    initial={false}
                    animate={{ scaleX: i <= step ? 1 : 0 }}
                    transition={{ duration: 0.7, ease }}
                  />
                </li>
              ))}
            </ol>
          </div>
        </div>
      </aside>

      {/* ── Right: the form ───────────────────────────────────── */}
      <section className="relative flex min-h-[70svh] flex-col lg:col-span-7 lg:min-h-svh" aria-label="Vote">
        {preview && (
          <div className="bg-gold/20 px-[var(--gutter)] py-3 text-sm text-espresso" role="status">
            <strong className="font-semibold">Preview mode.</strong> You&rsquo;re signed in as an administrator — votes
            submitted here are flagged as tests and excluded from results.
          </div>
        )}

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 3) void next();
            else submit();
          }}
          className="flex flex-1 flex-col px-[var(--gutter)] pb-32 pt-10 sm:pt-14 lg:px-[clamp(3rem,6vw,7rem)] lg:pb-14 lg:pt-20"
        >
          {/* Honeypot: hidden from people and assistive tech */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label>
              Website
              <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div className="flex-1">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={done ? "done" : step}
                custom={direction}
                initial={{ opacity: 0, x: reduce ? 0 : direction * 48 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduce ? 0 : direction * -32 }}
                transition={{ duration: 0.55, ease }}
              >
                {done ? (
                  <VoteSuccess restaurantName={restaurant?.name} test={result.test} />
                ) : (
                  <>
                    <StepHeading ref={headingRef} step={step} />

                    {step === 0 && (
                      <fieldset className="mt-10" aria-invalid={errors.restaurant ? true : undefined}>
                        <legend className="sr-only">Choose your restaurant</legend>
                        {restaurants.length === 0 ? (
                          <p className="text-charcoal/70">No restaurants are currently taking part. Please check back soon.</p>
                        ) : (
                          <div className="grid gap-3 sm:grid-cols-2 lg:gap-4">
                            {restaurants.map((r, i) => (
                              <label key={r.id} className="group relative block cursor-pointer">
                                <input type="radio" value={r.slug} {...register("restaurant")} className="peer sr-only" />
                                <span className="flex min-h-24 items-center gap-4 border lg:min-h-32 lg:gap-5 border-espresso/15 bg-white/60 p-3 pr-5 transition-all duration-300 group-hover:border-espresso/40 peer-checked:border-green peer-checked:bg-white peer-checked:shadow-[inset_0_0_0_1px_var(--color-green)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-green">
                                  <span className="relative size-[4.5rem] shrink-0 overflow-hidden bg-stone lg:size-24">
                                    {r.imageUrl && (
                                      <SmartImage src={r.imageUrl} alt="" fill sizes="96px" className="object-cover" />
                                    )}
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="eyebrow block text-[0.625rem] text-espresso/45">N° {String(i + 1).padStart(2, "0")}</span>
                                    <span className="mt-1 block font-display text-[1.375rem] leading-tight text-espresso lg:text-[1.75rem]">{r.name}</span>
                                  </span>
                                </span>
                                <span
                                  aria-hidden
                                  className="absolute right-4 top-1/2 grid size-7 -translate-y-1/2 scale-50 place-items-center rounded-full bg-green text-ivory opacity-0 transition-all duration-300 ease-[var(--ease-editorial)] peer-checked:scale-100 peer-checked:opacity-100"
                                >
                                  <Check className="size-4" strokeWidth={2.5} />
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                        <FieldError message={errors.restaurant?.message} />
                      </fieldset>
                    )}

                    {step === 1 && (
                      <>
                        {restaurant && (
                          <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-charcoal/70">
                            Dining at <span className="font-display text-base text-espresso">{restaurant.name}</span>
                            <button type="button" onClick={() => go(0)} className="link-underline font-semibold text-green-deep">
                              Change
                            </button>
                          </p>
                        )}
                        <fieldset className="mt-10" aria-invalid={errors.tiramisuType ? true : undefined}>
                          <legend className="sr-only">Choose your Tiramisù</legend>
                          <div className="grid grid-cols-2 gap-3 sm:gap-5">
                            {TYPES.map((t) => (
                              <label key={t.value} className="group relative block cursor-pointer">
                                <input type="radio" value={t.value} {...register("tiramisuType")} className="peer sr-only" />
                                <span className="block border border-espresso/15 bg-white/60 p-2 transition-all duration-300 group-hover:border-espresso/40 peer-checked:border-green peer-checked:bg-white peer-checked:shadow-[inset_0_0_0_1px_var(--color-green)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-green sm:p-3">
                                  <span className="relative block aspect-[4/5] overflow-hidden bg-stone">
                                    <Image
                                      src={t.image}
                                      alt={t.alt}
                                      fill
                                      placeholder="blur"
                                      sizes="(min-width: 1024px) 26vw, 50vw"
                                      className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-editorial)] group-hover:scale-[1.05]"
                                    />
                                  </span>
                                  <span className="block px-1 pb-2 pt-4 sm:px-2">
                                    <span className="block font-display text-[1.25rem] leading-tight text-espresso sm:text-[1.625rem]">{t.title}</span>
                                    <span className="mt-1.5 block text-[0.8125rem] leading-snug text-charcoal/65 sm:text-[0.9375rem]">{t.body}</span>
                                  </span>
                                </span>
                                <span
                                  aria-hidden
                                  className="absolute right-4 top-4 grid size-8 scale-50 place-items-center rounded-full bg-green text-ivory opacity-0 transition-all duration-300 ease-[var(--ease-editorial)] peer-checked:scale-100 peer-checked:opacity-100 sm:right-5 sm:top-5"
                                >
                                  <Check className="size-4" strokeWidth={2.5} />
                                </span>
                              </label>
                            ))}
                          </div>
                          <FieldError message={errors.tiramisuType?.message} />
                        </fieldset>
                      </>
                    )}

                    {step === 2 && (
                      <div className="mt-10 space-y-10">
                        {RATINGS.map((r, i) => (
                          <Controller
                            key={r.name}
                            control={control}
                            name={r.name}
                            render={({ field, fieldState }) => (
                              <RatingScale
                                index={i + 1}
                                name={field.name}
                                title={r.title}
                                question={r.question}
                                value={field.value}
                                onChange={(v) => {
                                  field.onChange(v);
                                  field.onBlur();
                                }}
                                error={fieldState.error?.message}
                              />
                            )}
                          />
                        ))}
                      </div>
                    )}

                    {step === 3 && (
                      <div className="mt-10">
                        <dl className="border-t border-espresso/15">
                          <ReviewRow label="Restaurant" onEdit={() => go(0)}>
                            {restaurant?.name ?? "—"}
                          </ReviewRow>
                          <ReviewRow label="Tiramisù" onEdit={() => go(1)}>
                            {TYPES.find((t) => t.value === values.tiramisuType)?.title ?? "—"}
                          </ReviewRow>
                          {RATINGS.map((r) => (
                            <ReviewRow key={r.name} label={r.title} onEdit={() => go(2)}>
                              <ReviewStars value={values[r.name]} />
                            </ReviewRow>
                          ))}
                        </dl>

                        {needsBotCheck && (
                          <div className="mt-8">
                            <Turnstile siteKey={turnstileSiteKey!} onToken={setToken} resetKey={resetKey} />
                          </div>
                        )}
                        <p className="mt-6 text-[0.8125rem] leading-relaxed text-charcoal/55">
                          Your vote is anonymous. We don&rsquo;t ask for your name, phone or email.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {serverError && !done && (
                <motion.p
                  role="alert"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-8 border-l-2 border-red bg-red/5 px-4 py-3 text-[0.9375rem] text-red-deep"
                >
                  {serverError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Actions: pinned to the thumb zone on mobile */}
          {!done && (
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-espresso/10 bg-ivory/95 px-[var(--gutter)] pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur-md lg:static lg:mt-16 lg:border-espresso/15 lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-8 lg:backdrop-blur-none">
              <div className="flex items-center justify-between gap-4">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => go(step - 1)}
                    className="inline-flex h-14 items-center gap-2 pr-3 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-espresso/80 hover:text-espresso"
                  >
                    <ArrowLeft aria-hidden className="size-4" />
                    Back
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  disabled={step === 3 ? !canSubmit : restaurants.length === 0}
                  className={cn(
                    "group relative inline-flex h-14 min-w-[11rem] flex-1 items-center justify-center gap-3 overflow-hidden px-7 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-ivory transition-colors sm:flex-none disabled:cursor-not-allowed disabled:opacity-50",
                    step === 3 ? "bg-green" : "bg-espresso",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-[var(--ease-editorial)] group-enabled:group-hover:scale-x-100",
                      "bg-red",
                    )}
                  />
                  <span className="relative">{pending ? "Submitting…" : step === 3 ? "Submit my vote" : "Continue"}</span>
                  {pending ? (
                    <Loader2 aria-hidden className="relative size-4 animate-spin" />
                  ) : (
                    <ArrowRight aria-hidden className="relative size-4 transition-transform duration-500 group-enabled:group-hover:translate-x-1" />
                  )}
                </button>
              </div>
              {step === 3 && needsBotCheck && !token && !pending && (
                <p className="mt-2 text-right text-xs text-charcoal/50">Verifying your browser…</p>
              )}
            </div>
          )}
        </form>
      </section>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-4 text-sm font-medium text-red-deep">
      {message}
    </p>
  );
}

function ReviewRow({ label, onEdit, children }: { label: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-espresso/15 py-5">
      <div className="min-w-0">
        <dt className="eyebrow text-espresso/50">{label}</dt>
        <dd className="mt-1.5 font-display text-[1.375rem] leading-tight text-espresso">{children}</dd>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex h-11 shrink-0 items-center gap-2 px-2 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-green-deep hover:text-espresso"
      >
        <Pencil aria-hidden className="size-3.5" />
        Edit<span className="sr-only"> {label}</span>
      </button>
    </div>
  );
}

function ReviewStars({ value }: { value?: number }) {
  if (!value) return <>—</>;
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span aria-hidden className="flex gap-0.5 text-[1.05rem] leading-none">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={n <= value ? (value >= 4 ? "text-green" : value === 3 ? "text-gold" : "text-red") : "text-espresso/20"}>
            ★
          </span>
        ))}
      </span>
      <span>
        {value} <span className="italic text-espresso/60">— {RATING_LABELS[value as keyof typeof RATING_LABELS]}</span>
      </span>
    </span>
  );
}

const HEADINGS = [
  { eyebrow: "Step one", title: "Where Are You Dining?", hint: "Choose the restaurant where you enjoyed your Tiramisù." },
  { eyebrow: "Step two", title: "Which Tiramisù Did You Experience?", hint: "Select the version that was served to you." },
  { eyebrow: "Step three", title: "Tell Us What You Think", hint: "Three quick ratings — from 1 (Awful) to 5 (Fantastic)." },
  { eyebrow: "Step four", title: "One Last Look", hint: "Check your answers. You can still edit anything." },
];

function StepHeading({ step, ref }: { step: number; ref: React.Ref<HTMLHeadingElement> }) {
  const h = HEADINGS[step];
  return (
    <header>
      <p className="eyebrow flex items-center gap-3 text-espresso/60">
        <span aria-hidden className="h-px w-6 bg-espresso/30" />
        {h.eyebrow}
      </p>
      <h1 ref={ref} tabIndex={-1} className="display mt-5 text-[clamp(2.375rem,4.6vw,4rem)] leading-[1] text-espresso outline-none">
        {h.title}
      </h1>
      <p className="mt-4 max-w-md text-[1.0625rem] leading-relaxed text-charcoal/70">{h.hint}</p>
    </header>
  );
}
