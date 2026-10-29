"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { cn } from "@/lib/utils";

// Validated with the dataviz palette checker (CVD ΔE ≥ 12 for every pair used).
export const SERIES = {
  single: "#008C45",
  classic: "#008C45",
  creative: "#8E5BC7",
  presentation: "#00703A",
  taste: "#D99A3A",
  overall: "#7E62C8",
} as const;

const INK = "#202020";
const MUTED = "rgba(32,32,32,0.55)";
const GRID = "rgba(48,34,28,0.08)";
const axis = { fontSize: 12, fill: MUTED };

function Empty({ children = "No votes yet — this chart fills in as votes arrive." }: { children?: React.ReactNode }) {
  return <div className="grid h-full min-h-48 place-items-center text-sm text-charcoal/50">{children}</div>;
}

function TooltipBox({ title, rows }: { title: string; rows: { label: string; value: string; color?: string }[] }) {
  return (
    <div className="min-w-40 rounded-[4px] border border-stone-line bg-white px-3 py-2 text-xs shadow-[0_8px_24px_-12px_rgba(30,21,17,0.35)]">
      <p className="mb-1.5 font-semibold text-espresso">{title}</p>
      {rows.map((r) => (
        <p key={r.label} className="flex items-center justify-between gap-4 py-0.5" style={{ color: INK }}>
          <span className="flex items-center gap-2 text-charcoal/70">
            {r.color && <span className="inline-block size-2.5 rounded-[2px]" style={{ background: r.color }} />}
            {r.label}
          </span>
          <span className="font-semibold tabular-nums">{r.value}</span>
        </p>
      ))}
    </div>
  );
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-charcoal/70">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-2">
          <span aria-hidden className="inline-block size-2.5 rounded-[2px]" style={{ background: i.color }} />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

// ── Votes by restaurant ───────────────────────────────────────
export function VotesByRestaurantChart({ data }: { data: { name: string; votes: number }[] }) {
  if (!data.some((d) => d.votes > 0)) return <Empty />;
  const sorted = [...data].sort((a, b) => b.votes - a.votes);
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, sorted.length * 44)}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 8 }} barCategoryGap={10}>
        <CartesianGrid horizontal={false} stroke={GRID} />
        <XAxis type="number" allowDecimals={false} tick={axis} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" width={130} tick={{ ...axis, fill: INK }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: "rgba(48,34,28,0.04)" }}
          content={({ active, payload }: TooltipContentProps<ValueType, NameType>) =>
            active && payload?.length ? (
              <TooltipBox title={String(payload[0].payload.name)} rows={[{ label: "Votes", value: String(payload[0].value), color: SERIES.single }]} />
            ) : null
          }
        />
        <Bar
          dataKey="votes"
          fill={SERIES.single}
          radius={[0, 4, 4, 0]}
          maxBarSize={22}
          label={{ position: "right", fill: INK, fontSize: 12, fontWeight: 600 }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── Votes over time ───────────────────────────────────────────
export function VotesOverTimeChart({ data }: { data: { day: string; votes: number }[] }) {
  if (!data.some((d) => d.votes > 0)) return <Empty />;
  const fmt = (d: string) =>
    new Date(`${d}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
        <defs>
          <linearGradient id="votesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SERIES.single} stopOpacity={0.18} />
            <stop offset="100%" stopColor={SERIES.single} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="day" tickFormatter={fmt} tick={axis} axisLine={false} tickLine={false} minTickGap={24} />
        <YAxis allowDecimals={false} tick={axis} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ stroke: "rgba(48,34,28,0.35)", strokeWidth: 1 }}
          content={({ active, payload }: TooltipContentProps<ValueType, NameType>) =>
            active && payload?.length ? (
              <TooltipBox title={fmt(String(payload[0].payload.day))} rows={[{ label: "Votes", value: String(payload[0].value), color: SERIES.single }]} />
            ) : null
          }
        />
        <Area
          type="monotone"
          dataKey="votes"
          stroke={SERIES.single}
          strokeWidth={2}
          fill="url(#votesFill)"
          dot={false}
          activeDot={{ r: 5, stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Classic vs Creative by restaurant ─────────────────────────
export function TypeSplitChart({ data }: { data: { name: string; classic: number; creative: number }[] }) {
  if (!data.some((d) => d.classic + d.creative > 0)) return <Empty />;
  return (
    <div className="space-y-3">
      <Legend items={[{ label: "Classic", color: SERIES.classic }, { label: "Creative", color: SERIES.creative }]} />
      <ResponsiveContainer width="100%" height={Math.max(180, data.length * 44)}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }} barCategoryGap={10}>
          <CartesianGrid horizontal={false} stroke={GRID} />
          <XAxis type="number" allowDecimals={false} tick={axis} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={130} tick={{ ...axis, fill: INK }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(48,34,28,0.04)" }}
            content={({ active, payload }: TooltipContentProps<ValueType, NameType>) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as { name: string; classic: number; creative: number };
              const total = p.classic + p.creative;
              const pct = (n: number) => (total ? ` (${Math.round((n / total) * 100)}%)` : "");
              return (
                <TooltipBox
                  title={p.name}
                  rows={[
                    { label: "Classic", value: `${p.classic}${pct(p.classic)}`, color: SERIES.classic },
                    { label: "Creative", value: `${p.creative}${pct(p.creative)}`, color: SERIES.creative },
                  ]}
                />
              );
            }}
          />
          {/* 2px surface gap between stacked segments */}
          <Bar dataKey="classic" stackId="t" fill={SERIES.classic} stroke="#fff" strokeWidth={2} maxBarSize={22} />
          <Bar dataKey="creative" stackId="t" fill={SERIES.creative} stroke="#fff" strokeWidth={2} radius={[0, 4, 4, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Average ratings by restaurant ─────────────────────────────
const METRICS = [
  { key: "presentation", label: "Presentation", color: SERIES.presentation },
  { key: "taste", label: "Taste", color: SERIES.taste },
  { key: "overall", label: "Overall", color: SERIES.overall },
] as const;

type MetricKey = (typeof METRICS)[number]["key"];

export function RatingsChart({
  data,
}: {
  data: { name: string; presentation: number | null; taste: number | null; overall: number | null; votes: number }[];
}) {
  const [focus, setFocus] = useState<MetricKey | "all">("all");
  const rated = data.filter((d) => d.votes > 0);
  const shown = focus === "all" ? METRICS : METRICS.filter((m) => m.key === focus);
  const rows =
    focus === "all" ? rated : [...rated].sort((a, b) => (b[focus] ?? 0) - (a[focus] ?? 0));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Compare by" className="inline-flex rounded-[3px] border border-stone-line bg-ivory p-0.5 text-xs">
          {[{ key: "all" as const, label: "All" }, ...METRICS].map((m) => (
            <button
              key={m.key}
              type="button"
              aria-pressed={focus === m.key}
              onClick={() => setFocus(m.key)}
              className={cn(
                "rounded-[2px] px-3 py-1.5 font-medium transition-colors",
                focus === m.key ? "bg-white text-espresso shadow-sm" : "text-charcoal/60 hover:text-espresso",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <Legend items={shown.map((m) => ({ label: m.label, color: m.color }))} />
      </div>
      {rows.length === 0 ? (
        <Empty />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={rows} margin={{ top: 16, right: 8, bottom: 0, left: -16 }} barGap={2} barCategoryGap="22%">
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="name" tick={{ ...axis, fill: INK }} axisLine={false} tickLine={false} interval={0} />
            <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={axis} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(48,34,28,0.04)" }}
              content={({ active, payload }: TooltipContentProps<ValueType, NameType>) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as (typeof rows)[number];
                return (
                  <TooltipBox
                    title={`${p.name} · ${p.votes} vote${p.votes === 1 ? "" : "s"}`}
                    rows={METRICS.map((m) => ({ label: m.label, value: (p[m.key] ?? 0).toFixed(2), color: m.color }))}
                  />
                );
              }}
            />
            {shown.map((m) => (
              <Bar
                key={m.key}
                dataKey={m.key}
                fill={m.color}
                radius={[4, 4, 0, 0]}
                maxBarSize={focus === "all" ? 20 : 36}
                label={focus === "all" ? undefined : { position: "top", fill: INK, fontSize: 12, fontWeight: 600, formatter: (v: unknown) => Number(v).toFixed(2) }}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
