"use client";

import { motion, useInView, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;
const viewport = { once: true, margin: "0px 0px -12% 0px" } as const;

/** Gentle rise-and-fade when the element scrolls into view. */
export function Reveal({
  delay = 0,
  y = 28,
  as = "div",
  className,
  children,
  ...rest
}: { delay?: number; y?: number; as?: "div" | "li" } & HTMLMotionProps<"div">) {
  const Comp = (as === "li" ? motion.li : motion.div) as typeof motion.div;
  return (
    <Comp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 1, ease, delay }}
      className={className}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/**
 * Masked line-by-line reveal for display type. Each entry in `lines` slides up
 * from behind its own mask. Screen readers get the plain sentence once.
 */
export function LineReveal({
  lines,
  as: Tag = "h2",
  className,
  lineClassName,
  delay = 0,
  stagger = 0.09,
  animateOnMount = false,
  id,
  label,
}: {
  lines: React.ReactNode[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  animateOnMount?: boolean;
  id?: string;
  /** Plain-text reading of the heading, when the visual lines need punctuation help. */
  label?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLHeadingElement>(null);
  // Observe the heading, not the lines: a line parked below its mask is
  // clipped, so it would never report itself as visible.
  const inView = useInView(ref, viewport);
  const show = animateOnMount || inView;
  return (
    <Tag ref={ref} id={id} aria-label={label} className={className}>
      {lines.map((line, i) => (
        <span key={i} aria-hidden={label ? true : undefined} className={cn("block overflow-hidden pb-[0.08em] -mb-[0.08em]", lineClassName)}>
          <motion.span
            className="block will-change-transform"
            initial={reduce ? false : { y: "105%" }}
            animate={show ? { y: "0%" } : undefined}
            transition={{ duration: 1.1, ease, delay: delay + i * stagger }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Curtain-style image reveal: the frame opens from the bottom edge. */
export function ImageReveal({
  className,
  children,
  delay = 0,
  direction = "up",
}: {
  className?: string;
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "left";
}) {
  const from = direction === "up" ? "inset(100% 0% 0% 0%)" : "inset(0% 100% 0% 0%)";
  return (
    <motion.div
      className={cn("relative overflow-hidden", className)}
      initial={{ clipPath: from }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={viewport}
      transition={{ duration: 1.4, ease: [0.76, 0, 0.24, 1], delay }}
    >
      <motion.div
        className="relative h-full w-full"
        initial={{ scale: 1.18 }}
        whileInView={{ scale: 1 }}
        viewport={viewport}
        transition={{ duration: 2, ease, delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Hairline that draws itself across when in view. */
export function DrawLine({ className, delay = 0, vertical = false }: { className?: string; delay?: number; vertical?: boolean }) {
  return (
    <motion.span
      aria-hidden
      className={cn("block", vertical ? "origin-top" : "origin-left", className)}
      initial={vertical ? { scaleY: 0 } : { scaleX: 0 }}
      whileInView={vertical ? { scaleY: 1 } : { scaleX: 1 }}
      viewport={viewport}
      transition={{ duration: 1.4, ease, delay }}
    />
  );
}
