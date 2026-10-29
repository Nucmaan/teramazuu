import "server-only";
import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import type { TiramisuType } from "@/lib/generated/prisma/enums";
import { CAMPAIGN_TZ, campaignDayKey, startOfCampaignDay, fromCampaignLocal } from "@/lib/time";

const REAL = { isTest: false } satisfies Prisma.VoteWhereInput;

export async function getOverview() {
  const now = new Date();
  const [total, today, restaurants, byType, avg, tests] = await Promise.all([
    db.vote.count({ where: REAL }),
    db.vote.count({ where: { ...REAL, createdAt: { gte: startOfCampaignDay(now) } } }),
    db.restaurant.count({ where: { isActive: true } }),
    db.vote.groupBy({ by: ["tiramisuType"], where: REAL, _count: { _all: true } }),
    db.vote.aggregate({
      where: REAL,
      _avg: { presentationRating: true, tasteRating: true, overallRating: true },
    }),
    db.vote.count({ where: { isTest: true } }),
  ]);
  const typeCount = (t: TiramisuType) => byType.find((b) => b.tiramisuType === t)?._count._all ?? 0;
  return {
    total,
    today,
    restaurants,
    classic: typeCount("CLASSIC"),
    creative: typeCount("CREATIVE"),
    avgPresentation: avg._avg.presentationRating,
    avgTaste: avg._avg.tasteRating,
    avgOverall: avg._avg.overallRating,
    tests,
  };
}

export type RestaurantStat = {
  id: string;
  name: string;
  isActive: boolean;
  votes: number;
  classic: number;
  creative: number;
  presentation: number | null;
  taste: number | null;
  overall: number | null;
};

export async function getRestaurantStats(): Promise<RestaurantStat[]> {
  const [restaurants, grouped] = await Promise.all([
    db.restaurant.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, isActive: true } }),
    db.vote.groupBy({
      by: ["restaurantId", "tiramisuType"],
      where: REAL,
      _count: { _all: true },
      _sum: { presentationRating: true, tasteRating: true, overallRating: true },
    }),
  ]);
  return restaurants.map((r) => {
    const rows = grouped.filter((g) => g.restaurantId === r.id);
    const votes = rows.reduce((n, g) => n + g._count._all, 0);
    const sum = (k: "presentationRating" | "tasteRating" | "overallRating") =>
      rows.reduce((n, g) => n + (g._sum[k] ?? 0), 0);
    const avg = (k: "presentationRating" | "tasteRating" | "overallRating") => (votes ? sum(k) / votes : null);
    return {
      ...r,
      votes,
      classic: rows.find((g) => g.tiramisuType === "CLASSIC")?._count._all ?? 0,
      creative: rows.find((g) => g.tiramisuType === "CREATIVE")?._count._all ?? 0,
      presentation: avg("presentationRating"),
      taste: avg("tasteRating"),
      overall: avg("overallRating"),
    };
  });
}

/** Daily vote counts in Mogadishu calendar days, gap-filled across the campaign window. */
export async function getVotesOverTime(start: Date, end: Date) {
  const rows = await db.$queryRaw<{ day: string; count: bigint }[]>`
    SELECT to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE ${CAMPAIGN_TZ}, 'YYYY-MM-DD') AS day,
           COUNT(*)::bigint AS count
    FROM "Vote"
    WHERE "isTest" = false
    GROUP BY 1
    ORDER BY 1`;
  const counts = new Map(rows.map((r) => [r.day, Number(r.count)]));

  // Span the campaign window, extended to any days that hold votes.
  const days = new Set<string>();
  const last = campaignDayKey(new Date(Math.min(end.getTime(), Math.max(Date.now(), start.getTime()))));
  for (let d = startOfCampaignDay(start); campaignDayKey(d) <= last; d = new Date(d.getTime() + 86_400_000)) {
    days.add(campaignDayKey(d));
  }
  for (const k of counts.keys()) days.add(k);
  return [...days].sort().map((day) => ({ day, votes: counts.get(day) ?? 0 }));
}

// ── Vote management ───────────────────────────────────────────

export type VoteFilters = {
  q?: string;
  restaurant?: string;
  type?: string;
  minOverall?: string;
  from?: string;
  to?: string;
  tests?: string;
  page?: string;
};

export function buildVoteWhere(f: VoteFilters): Prisma.VoteWhereInput {
  const where: Prisma.VoteWhereInput = {};
  if (f.tests !== "include" && f.tests !== "only") where.isTest = false;
  if (f.tests === "only") where.isTest = true;
  if (f.restaurant) where.restaurantId = f.restaurant;
  if (f.type === "CLASSIC" || f.type === "CREATIVE") where.tiramisuType = f.type;
  const min = Number(f.minOverall);
  if (Number.isInteger(min) && min >= 1 && min <= 5) where.overallRating = { gte: min };
  const created: Prisma.DateTimeFilter = {};
  const from = f.from && /^\d{4}-\d{2}-\d{2}$/.test(f.from) ? fromCampaignLocal(`${f.from}T00:00`) : null;
  const to = f.to && /^\d{4}-\d{2}-\d{2}$/.test(f.to) ? fromCampaignLocal(`${f.to}T00:00`) : null;
  if (from) created.gte = from;
  if (to) created.lt = new Date(to.getTime() + 86_400_000);
  if (from || to) where.createdAt = created;
  const q = f.q?.trim().slice(0, 80);
  if (q) {
    where.OR = [{ id: { startsWith: q } }, { restaurant: { name: { contains: q, mode: "insensitive" } } }];
  }
  return where;
}

export const PAGE_SIZE = 25;

export async function listVotes(f: VoteFilters) {
  const where = buildVoteWhere(f);
  const page = Math.max(1, Math.min(10_000, Number.parseInt(f.page ?? "1", 10) || 1));
  const [total, rows] = await Promise.all([
    db.vote.count({ where }),
    db.vote.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        tiramisuType: true,
        presentationRating: true,
        tasteRating: true,
        overallRating: true,
        isTest: true,
        createdAt: true,
        restaurant: { select: { name: true } },
      },
    }),
  ]);
  return { total, rows, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}
