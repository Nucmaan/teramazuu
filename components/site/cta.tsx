import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "green" | "espresso" | "ivory" | "outline-light" | "outline-dark";

const variants: Record<Variant, { base: string; fill: string }> = {
  green: { base: "bg-green text-ivory", fill: "bg-espresso-deep" },
  espresso: { base: "bg-espresso text-ivory", fill: "bg-red" },
  ivory: { base: "bg-ivory text-espresso", fill: "bg-red" },
  "outline-light": { base: "border border-ivory/40 text-ivory", fill: "bg-ivory" },
  "outline-dark": { base: "border border-espresso/25 text-espresso", fill: "bg-espresso" },
};

const hoverText: Partial<Record<Variant, string>> = {
  ivory: "group-hover:text-ivory",
  "outline-light": "group-hover:text-espresso",
  "outline-dark": "group-hover:text-ivory",
};

/** Square editorial CTA with a sliding fill and travelling arrow. */
export function Cta({
  href,
  children,
  variant = "green",
  className,
  size = "lg",
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  size?: "md" | "lg";
}) {
  const v = variants[variant];
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex items-center justify-between gap-6 overflow-hidden font-semibold uppercase tracking-[0.18em] transition-colors",
        size === "lg" ? "h-[3.75rem] pl-7 pr-6 text-[0.78rem]" : "h-12 pl-5 pr-4 text-[0.72rem]",
        v.base,
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 origin-left scale-x-0 transition-transform duration-[650ms] ease-[var(--ease-editorial)] group-hover:scale-x-100",
          v.fill,
        )}
      />
      <span className={cn("relative transition-colors duration-500", hoverText[variant])}>{children}</span>
      <span className={cn("relative flex w-5 overflow-hidden transition-colors duration-500", hoverText[variant])} aria-hidden>
        <ArrowRight className="size-5 shrink-0 transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:translate-x-full" />
        <ArrowRight className="size-5 shrink-0 -translate-x-[200%] transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:-translate-x-full" />
      </span>
    </Link>
  );
}
