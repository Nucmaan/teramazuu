import { cn } from "@/lib/utils";

/** Editorial section marker: "§ 01 — Label". */
export function SectionIndex({
  n,
  children,
  tone = "dark",
  className,
}: {
  n: string;
  children: React.ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <p className={cn("eyebrow flex items-center gap-4", tone === "dark" ? "text-espresso/70" : "text-ivory/70", className)}>
      <span className={cn("shrink-0 whitespace-nowrap font-display text-[0.9rem] normal-case tracking-normal italic", tone === "dark" ? "text-gold" : "text-gold-soft")}>
        § {n}
      </span>
      <span aria-hidden className={cn("h-px w-8 shrink-0", tone === "dark" ? "bg-espresso/25" : "bg-ivory/30")} />
      {children}
    </p>
  );
}
