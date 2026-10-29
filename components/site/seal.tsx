import { cn } from "@/lib/utils";

/** Slowly rotating circular legend — a stamp-like campaign seal. */
export function Seal({ className, text, center, id = "seal" }: { className?: string; text: string; center?: React.ReactNode; id?: string }) {
  return (
    <div className={cn("relative grid place-items-center rounded-full bg-ivory", className)} aria-hidden>
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full animate-spin-slow motion-reduce:animate-none">
        <defs>
          <path id={id} d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text className="fill-espresso" style={{ fontSize: 13.5, letterSpacing: "0.32em", fontWeight: 600, textTransform: "uppercase" }}>
          <textPath href={`#${id}`}>{text}</textPath>
        </text>
      </svg>
      <div className="relative">{center}</div>
    </div>
  );
}
