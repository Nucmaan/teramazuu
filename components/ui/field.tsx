import { cn } from "@/lib/utils";

const control =
  "w-full rounded-[3px] border border-stone-line bg-white px-3 text-sm text-charcoal placeholder:text-charcoal/40 transition-colors focus-visible:border-green focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-green/30 disabled:opacity-60 aria-invalid:border-red";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(control, "h-10", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-24 py-2 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return <select className={cn(control, "h-10 pr-8", className)} {...props} />;
}

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("text-[0.8125rem] font-medium text-espresso", className)} {...props} />;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-deep">{error}</p>
      ) : hint ? (
        <p className="text-xs text-charcoal/55">{hint}</p>
      ) : null}
    </div>
  );
}
