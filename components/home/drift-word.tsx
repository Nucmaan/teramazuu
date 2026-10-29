"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/** Oversized word that drifts horizontally as the section passes. No scroll-jacking. */
export function DriftWord({ children, className, from = "4%", to = "-18%" }: { children: string; className?: string; from?: string; to?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], [from, to]);
  return (
    <div ref={ref} aria-hidden className="overflow-hidden">
      <motion.p style={{ x: reduce ? 0 : x }} className={cn("whitespace-nowrap", className)}>
        {children}
      </motion.p>
    </div>
  );
}
