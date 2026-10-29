"use server";

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { getAdmin } from "@/lib/auth";
import { getCampaignSettings, getVotingStatus, TAGS } from "@/lib/campaign";
import { botCheckConfigured, getClientAddress, keyedHash, randomToken, verifyTurnstile } from "@/lib/security";
import { voteSubmissionSchema } from "@/lib/validation";

export type VoteResult =
  | { ok: true; test: boolean }
  | { ok: false; code: "invalid" | "closed" | "bot" | "limit" | "restaurant" | "error"; message: string };

const DEVICE_COOKIE = "scim_device";

export async function submitVote(raw: unknown, options: { preview?: boolean } = {}): Promise<VoteResult> {
  const parsed = voteSubmissionSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, code: "invalid", message: "Some answers are missing. Please review your vote and try again." };
  }
  const { website, turnstileToken, ...vote } = parsed.data;

  // Honeypot filled in: respond as if accepted, store nothing.
  if (website) return { ok: true, test: false };

  try {
    const settings = await getCampaignSettings();
    const status = getVotingStatus(settings);

    // Preview votes are an explicit, authenticated testing mechanism; they are
    // flagged and excluded from every count and chart.
    let isTest = false;
    if (options.preview) {
      const admin = await getAdmin();
      if (!admin) return { ok: false, code: "closed", message: "Preview voting requires an administrator session." };
      isTest = true;
    } else if (status !== "open") {
      return { ok: false, code: "closed", message: "Voting is temporarily paused. Please try again shortly." };
    }

    const address = await getClientAddress();

    // Turnstile is optional: without keys, the honeypot and the device/network
    // limits below are the safeguards.
    if (settings.requireBotCheck && !isTest && botCheckConfigured()) {
      if (!(await verifyTurnstile(turnstileToken, address))) {
        return { ok: false, code: "bot", message: "We couldn't confirm you're human. Please complete the check and try again." };
      }
    }

    const restaurant = await db.restaurant.findFirst({
      where: { slug: vote.restaurant, isActive: true },
      select: { id: true, name: true },
    });
    if (!restaurant) {
      return { ok: false, code: "restaurant", message: "That restaurant isn't taking part. Please choose another." };
    }

    // Anonymous device token — a speed bump against repeat voting, not proof
    // of identity. Clearing cookies or switching devices bypasses it.
    const store = await cookies();
    let device = store.get(DEVICE_COOKIE)?.value;
    if (!device || device.length < 16 || device.length > 64) {
      device = randomToken(18);
      store.set(DEVICE_COOKIE, device, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 60,
      });
    }
    const deviceHash = keyedHash("device", device);
    const networkHash = address === "unknown" ? null : keyedHash("network", address);

    const result = await db.$transaction(async (tx) => {
      if (!isTest) {
        // Serialise concurrent submissions from the same device.
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${deviceHash}))`;

        if (settings.maxVotesPerDevicePerRestaurant > 0) {
          const count = await tx.vote.count({
            where: { deviceHash, restaurantId: restaurant.id, isTest: false },
          });
          if (count >= settings.maxVotesPerDevicePerRestaurant) return "device-limit" as const;
        }
        if (networkHash && settings.maxVotesPerNetworkPerHour > 0) {
          const count = await tx.vote.count({
            where: { networkHash, isTest: false, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
          });
          if (count >= settings.maxVotesPerNetworkPerHour) return "network-limit" as const;
        }
      }
      await tx.vote.create({
        data: {
          restaurantId: restaurant.id,
          tiramisuType: vote.tiramisuType,
          presentationRating: vote.presentationRating,
          tasteRating: vote.tasteRating,
          overallRating: vote.overallRating,
          deviceHash,
          networkHash,
          isTest,
        },
      });
      return "created" as const;
    });

    if (result === "device-limit") {
      return {
        ok: false,
        code: "limit",
        message: `It looks like a vote for ${restaurant.name} has already been submitted from this device. Grazie!`,
      };
    }
    if (result === "network-limit") {
      return { ok: false, code: "limit", message: "Many votes have come from this network recently. Please try again a little later." };
    }

    revalidateTag(TAGS.results, "max");
    return { ok: true, test: isTest };
  } catch (error) {
    console.error("submitVote failed", error);
    return { ok: false, code: "error", message: "Something went wrong on our side. Please try again." };
  }
}
