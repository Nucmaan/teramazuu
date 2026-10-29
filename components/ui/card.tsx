import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("rounded-[4px] border border-stone-line/80 bg-white", className)} {...props} />;
}

export function CardHeader({ title, description, action, className }: { title: string; description?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 border-b border-stone px-5 py-4", className)}>
      <div>
        <h2 className="text-[0.9375rem] font-semibold text-espresso">{title}</h2>
        {description && <p className="mt-0.5 text-[0.8125rem] text-charcoal/60">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Badge({ className, tone = "neutral", ...props }: React.ComponentProps<"span"> & { tone?: "neutral" | "green" | "red" | "gold" }) {
  const tones = {
    neutral: "bg-stone text-espresso",
    green: "bg-green/10 text-green-deep",
    red: "bg-red/10 text-red-deep",
    gold: "bg-gold/15 text-cocoa",
  };
  return <span className={cn("inline-flex items-center rounded-[3px] px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em]", tones[tone], className)} {...props} />;
}
