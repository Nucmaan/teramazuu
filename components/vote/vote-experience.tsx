"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { Controller, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Check, Loader2, X } from "lucide-react";
import type { PublicRestaurant } from "@/lib/campaign";
import { voteSchema, type VoteInput } from "@/lib/validation";
import { submitVote } from "@/app/vote/actions";
import { RatingScale } from "@/components/vote/rating-scale";
import { Turnstile } from "@/components/vote/turnstile";
import { VoteSuccess } from "@/components/vote/success";
import { SmartImage } from "@/components/site/smart-image";
import { cn } from "@/lib/utils";
import heroImage from "@/public/images/photo/hero-coupe.jpg";
import classicImage from "@/public/images/photo/classic.jpg";
import creativeImage from "@/public/images/photo/creative.jpg";

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
    body: "A creative take on the Italian classic.",
    image: creativeImage,
    alt: "A Tiramisù plated with orange, mint, chocolate and pomegranate",
  },
];

const RATINGS = [
  { name: "presentationRating" as const, title: "Presentation", question: "How do you rate the presentation of your Tiramisù?" },
  { name: "tasteRating" as const, title: "Taste", question: "How do you rate the taste of your Tiramisù?" },
  { name: "overallRating" as const, title: "Overall experience", question: "How do you rate your overall Tiramisù experience?" },
];

/** Page order, so an invalid submit scrolls to the first missing answer. */
const FIELD_ORDER = ["restaurant", "tiramisuType", "presentationRating", "tasteRating", "overallRating"] as const;

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
    handleSubmit,
    formState: { errors },
  } = useForm<VoteInput>({
    resolver: zodResolver(voteSchema),
    defaultValues: { restaurant: preselected },
    reValidateMode: "onChange",
    shouldFocusError: false,
  });

  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<{ test: boolean } | null>(null);
  const [pending, startTransition] = useTransition();
  const honeypot = useRef<HTMLInputElement>(null);

  const restaurantSlug = useWatch({ control, name: "restaurant" });
  const restaurant = restaurants.find((r) => r.slug === restaurantSlug);
  const done = result !== null;

  function scrollToField(name: string) {
    document.getElementById(`field-${name}`)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  }

  function onValid(values: VoteInput) {
    setServerError(null);
    startTransition(async () => {
      const res = await submitVote({ ...values, turnstileToken: token, website: honeypot.current?.value ?? "" }, { preview });
      if (res.ok) {
        setResult({ test: res.test });
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      } else {
        setServerError(res.message);
        if (res.code === "bot") setResetKey((k) => k + 1);
        if (res.code === "restaurant") scrollToField("restaurant");
      }
    });
  }

  function onInvalid(errs: FieldErrors<VoteInput>) {
    setServerError(null);
    const first = FIELD_ORDER.find((k) => errs[k]);
    if (first) scrollToField(first);
  }

  const needsBotCheck = Boolean(turnstileSiteKey) && !preview;
  const canSubmit = !pending && restaurants.length > 0 && (!needsBotCheck || token.length > 0);

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

        <div className="flex h-full flex-col justify-between px-[var(--gutter)] pb-8 pt-5 lg:py-10">
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

          <div className="mt-10 lg:mt-0">
            <p className="eyebrow flex items-center gap-3 text-ivory/70">
              <span aria-hidden className="tricolore inline-block h-[2px] w-8" />
              #SCIM2026 · Mogadishu
            </p>
            <p className="display mt-5 max-w-[14ch] text-[clamp(2rem,3.6vw,3.75rem)] leading-[1.02] lg:mt-8">
              {done ? "Grazie. Your taste has spoken." : "Every great Tiramisù begins at a table."}
            </p>
          </div>
        </div>
      </aside>

      {/* ── Right: the ballot, all on one page ───────────────────── */}
      <section className="relative lg:col-span-7" aria-label="Vote">
        {preview && (
          <div className="bg-gold/20 px-[var(--gutter)] py-3 text-sm text-espresso" role="status">
            <strong className="font-semibold">Preview mode.</strong> You&rsquo;re signed in as an administrator — votes
            submitted here are flagged as tests and excluded from results.
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: reduce ? 0 : 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease }}
              className="px-[var(--gutter)] py-14 lg:px-[clamp(3rem,6vw,7rem)] lg:py-20"
            >
              <VoteSuccess restaurantName={restaurant?.name} test={result.test} />
            </motion.div>
          ) : (
            <motion.form
              key="form"
              noValidate
              onSubmit={(e) => void handleSubmit(onValid, onInvalid)(e)}
              exit={{ opacity: 0 }}
              className="px-[var(--gutter)] pb-36 pt-10 sm:pt-14 lg:px-[clamp(3rem,6vw,7rem)] lg:pb-16 lg:pt-20"
            >
              {/* Honeypot: hidden from people and assistive tech */}
              <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label>
                  Website
                  <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              <header>
                <h1 className="display text-[clamp(2.25rem,4.4vw,3.75rem)] leading-[1] text-espresso">Vote for the Best Tiramisù</h1>
                <p className="mt-4 max-w-md text-[1.0625rem] leading-relaxed text-charcoal/70">
                  Pick your restaurant and Tiramisù, rate it, and submit. It takes less than a minute.
                </p>
              </header>

              {/* 1 · Restaurant */}
              <fieldset id="field-restaurant" className="mt-12 scroll-mt-24" aria-invalid={errors.restaurant ? true : undefined}>
                <SectionLegend n={1}>Where did you eat?</SectionLegend>
                {restaurants.length === 0 ? (
                  <p className="mt-5 text-charcoal/70">No restaurants are currently taking part. Please check back soon.</p>
                ) : (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {restaurants.map((r) => (
                      <label key={r.id} className="group relative block cursor-pointer">
                        <input type="radio" value={r.slug} {...register("restaurant")} className="peer sr-only" />
                        <span className="flex min-h-20 items-center gap-4 border border-espresso/15 bg-white/60 p-2.5 pr-12 transition-all duration-300 group-hover:border-espresso/40 peer-checked:border-green peer-checked:bg-white peer-checked:shadow-[inset_0_0_0_1px_var(--color-green)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-green">
                          <span className="relative size-14 shrink-0 overflow-hidden bg-stone">
                            {r.imageUrl && <SmartImage src={r.imageUrl} alt="" fill sizes="56px" className="object-cover" />}
                          </span>
                          <span className="min-w-0 font-display text-[1.25rem] leading-tight text-espresso">{r.name}</span>
                        </span>
                        <CheckBadge className="right-3 top-1/2 -translate-y-1/2" />
                      </label>
                    ))}
                  </div>
                )}
                <FieldError message={errors.restaurant?.message} />
              </fieldset>

              {/* 2 · Tiramisù type */}
              <fieldset id="field-tiramisuType" className="mt-12 scroll-mt-24" aria-invalid={errors.tiramisuType ? true : undefined}>
                <SectionLegend n={2}>Which Tiramisù did you have?</SectionLegend>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
                  {TYPES.map((t) => (
                    <label key={t.value} className="group relative block cursor-pointer">
                      <input type="radio" value={t.value} {...register("tiramisuType")} className="peer sr-only" />
                      <span className="block border border-espresso/15 bg-white/60 p-2 transition-all duration-300 group-hover:border-espresso/40 peer-checked:border-green peer-checked:bg-white peer-checked:shadow-[inset_0_0_0_1px_var(--color-green)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-green">
                        <span className="relative block aspect-[4/3] overflow-hidden bg-stone">
                          <Image
                            src={t.image}
                            alt={t.alt}
                            fill
                            placeholder="blur"
                            sizes="(min-width: 1024px) 26vw, 50vw"
                            className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-editorial)] group-hover:scale-[1.05]"
                          />
                        </span>
                        <span className="block px-1 pb-1.5 pt-3">
                          <span className="block font-display text-[1.125rem] leading-tight text-espresso sm:text-[1.375rem]">{t.title}</span>
                          <span className="mt-1 block text-[0.8125rem] leading-snug text-charcoal/65">{t.body}</span>
                        </span>
                      </span>
                      <CheckBadge className="right-4 top-4" />
                    </label>
                  ))}
                </div>
                <FieldError message={errors.tiramisuType?.message} />
              </fieldset>

              {/* 3 · Ratings */}
              <div className="mt-12">
                <SectionLegend n={3} as="h2">
                  Rate your Tiramisù
                </SectionLegend>
                <div className="mt-5 space-y-8">
                  {RATINGS.map((r, i) => (
                    <div key={r.name} id={`field-${r.name}`} className="scroll-mt-24">
                      <Controller
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
                    </div>
                  ))}
                </div>
              </div>

              {needsBotCheck && (
                <div className="mt-10">
                  <Turnstile siteKey={turnstileSiteKey!} onToken={setToken} resetKey={resetKey} />
                </div>
              )}

              <p className="mt-10 text-[0.8125rem] leading-relaxed text-charcoal/55">
                Your vote is anonymous. We don&rsquo;t ask for your name, phone or email.
              </p>

              <AnimatePresence>
                {serverError && (
                  <motion.p
                    role="alert"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 border-l-2 border-red bg-red/5 px-4 py-3 text-[0.9375rem] text-red-deep"
                  >
                    {serverError}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Submit: pinned to the thumb zone on mobile */}
              <div className="fixed inset-x-0 bottom-0 z-30 border-t border-espresso/10 bg-ivory/95 px-[var(--gutter)] pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:static lg:mt-10 lg:border-espresso/15 lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-8 lg:backdrop-blur-none">
                <div className="flex items-center justify-between gap-4">
                  <p className="hidden min-w-0 truncate text-sm text-charcoal/60 sm:block">
                    {restaurant ? (
                      <>
                        Voting for <span className="font-display text-base text-espresso">{restaurant.name}</span>
                      </>
                    ) : (
                      "Choose a restaurant above"
                    )}
                  </p>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="group relative inline-flex h-14 flex-1 items-center justify-center gap-3 overflow-hidden bg-green px-7 text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-ivory transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[14rem] sm:flex-none"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-0 origin-left scale-x-0 bg-red transition-transform duration-500 ease-[var(--ease-editorial)] group-enabled:group-hover:scale-x-100"
                    />
                    <span className="relative">{pending ? "Submitting…" : "Submit my vote"}</span>
                    {pending ? (
                      <Loader2 aria-hidden className="relative size-4 animate-spin" />
                    ) : (
                      <ArrowRight aria-hidden className="relative size-4 transition-transform duration-500 group-enabled:group-hover:translate-x-1" />
                    )}
                  </button>
                </div>
                {needsBotCheck && !token && !pending && (
                  <p className="mt-2 text-right text-xs text-charcoal/50">Verifying your browser…</p>
                )}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

function SectionLegend({ n, children, as = "legend" }: { n: number; children: React.ReactNode; as?: "legend" | "h2" }) {
  const Tag = as;
  return (
    <Tag className="flex items-center gap-3 font-display text-[1.5rem] leading-tight text-espresso">
      <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-green font-sans text-sm font-semibold text-ivory">
        {n}
      </span>
      {children}
    </Tag>
  );
}

function CheckBadge({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute grid size-7 scale-50 place-items-center rounded-full bg-green text-ivory opacity-0 transition-all duration-300 ease-[var(--ease-editorial)] peer-checked:scale-100 peer-checked:opacity-100",
        className,
      )}
    >
      <Check className="size-4" strokeWidth={2.5} />
    </span>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-3 text-sm font-medium text-red-deep">
      {message}
    </p>
  );
}
