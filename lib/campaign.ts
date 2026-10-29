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

export type VotingStatus = "open" | "paused";

/** Voting is open straight away — there is no start or end time, only the admin pause switch. */
export function getVotingStatus(settings: Pick<CampaignSettingsData, "votingEnabled">): VotingStatus {
  return settings.votingEnabled ? "open" : "paused";
}
