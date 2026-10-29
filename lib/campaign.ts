import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";

export const TAGS = {
  campaign: "campaign",
  restaurants: "restaurants",
  results: "results",
} as const;

/** 30 Oct 2026 00:00 → 10 Nov 2026 23:59 in Africa/Mogadishu (UTC+3). */
export const DEFAULT_WINDOW = {
  startDate: new Date("2026-10-29T21:00:00.000Z"),
  endDate: new Date("2026-11-10T20:59:59.000Z"),
};

export type CampaignSettingsData = Awaited<ReturnType<typeof getCampaignSettings>>;

export async function getCampaignSettings() {
  "use cache";
  cacheTag(TAGS.campaign);
  cacheLife("hours");
  const settings = await db.campaignSettings.findUnique({ where: { id: 1 } });
  return (
    settings ?? {
      id: 1,
      title: "Week of Italian Cuisine in the World 2026",
      ...DEFAULT_WINDOW,
      votingEnabled: true,
      resultsPublic: false,
      heroIntro:
        "Experience the art of Italian cuisine in Mogadishu. Discover exceptional Tiramisù, celebrate authentic flavors, and vote for your favorite.",
      offerNote: "",
      maxVotesPerDevicePerRestaurant: 1,
      maxVotesPerNetworkPerHour: 40,
      requireBotCheck: true,
      updatedAt: new Date(0),
    }
  );
}

export type PublicRestaurant = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
};

export async function getActiveRestaurants(): Promise<PublicRestaurant[]> {
  "use cache";
  cacheTag(TAGS.restaurants);
  cacheLife("hours");
  return db.restaurant.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, description: true, imageUrl: true },
  });
}

export type VotingStatus = "upcoming" | "open" | "closed" | "paused";

export function getVotingStatus(
  settings: Pick<CampaignSettingsData, "startDate" | "endDate" | "votingEnabled">,
  now: Date,
): VotingStatus {
  if (now < settings.startDate) return "upcoming";
  if (now > settings.endDate) return "closed";
  if (!settings.votingEnabled) return "paused";
  return "open";
}

/** Public leaderboard — only rendered when resultsPublic is enabled. */
export async function getPublicResults() {
  "use cache";
  cacheTag(TAGS.results);
  cacheLife("minutes");
  const [restaurants, grouped] = await Promise.all([
    db.restaurant.findMany({ select: { id: true, name: true, slug: true, imageUrl: true } }),
    db.vote.groupBy({
      by: ["restaurantId"],
      where: { isTest: false },
      _count: { _all: true },
      _avg: { presentationRating: true, tasteRating: true, overallRating: true },
    }),
  ]);
  const byId = new Map(restaurants.map((r) => [r.id, r]));
  return grouped
    .map((g) => ({
      restaurant: byId.get(g.restaurantId)!,
      votes: g._count._all,
      presentation: g._avg.presentationRating ?? 0,
      taste: g._avg.tasteRating ?? 0,
      overall: g._avg.overallRating ?? 0,
    }))
    .filter((r) => r.restaurant)
    .sort((a, b) => b.overall - a.overall || b.votes - a.votes);
}
