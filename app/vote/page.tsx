import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getActiveRestaurants, getCampaignSettings, getVotingStatus } from "@/lib/campaign";
import { VoteExperience } from "@/components/vote/vote-experience";
import { VotingState } from "@/components/vote/voting-state";

export const metadata: Metadata = {
  title: "Vote for the Best Tiramisù",
  description:
    "Choose your restaurant, rate your Tiramisù and cast your vote — Week of Italian Cuisine in the World 2026, Mogadishu.",
  alternates: { canonical: "/vote" },
};

export default function VotePage({ searchParams }: PageProps<"/vote">) {
  return (
    <Suspense fallback={<VoteSkeleton />}>
      <VoteGate searchParams={searchParams} />
    </Suspense>
  );
}

async function VoteGate({ searchParams }: { searchParams: PageProps<"/vote">["searchParams"] }) {
  await connection(); // the open/closed decision depends on the current time
  const sp = await searchParams;
  const slug = typeof sp.restaurant === "string" ? sp.restaurant : undefined;
  const wantsPreview = sp.preview === "1";

  const [settings, restaurants, admin] = await Promise.all([
    getCampaignSettings(),
    getActiveRestaurants(),
    wantsPreview ? getAdmin() : Promise.resolve(null),
  ]);
  const status = getVotingStatus(settings, new Date());
  // Authenticated admins may rehearse the ballot at any time; those votes are flagged as tests.
  const preview = wantsPreview && admin !== null;

  if (status !== "open" && !preview) {
    return (
      <VotingState
        status={status}
        startDate={settings.startDate}
        endDate={settings.endDate}
        resultsPublic={settings.resultsPublic}
      />
    );
  }

  return (
    <VoteExperience
      restaurants={restaurants}
      initialRestaurant={slug}
      preview={preview}
      turnstileSiteKey={settings.requireBotCheck ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY : undefined}
    />
  );
}

function VoteSkeleton() {
  return (
    <div className="min-h-svh bg-ivory lg:grid lg:grid-cols-12" aria-busy="true" aria-label="Loading the ballot">
      <div className="h-56 bg-espresso-deep lg:col-span-5 lg:h-svh" />
      <div className="space-y-6 px-[var(--gutter)] py-14 lg:col-span-7 lg:px-[clamp(3rem,6vw,7rem)] lg:pt-20">
        <div className="h-3 w-24 animate-pulse bg-stone" />
        <div className="h-14 w-4/5 animate-pulse bg-stone" />
        <div className="grid gap-3 pt-6 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse bg-stone/70" />
          ))}
        </div>
      </div>
    </div>
  );
}
