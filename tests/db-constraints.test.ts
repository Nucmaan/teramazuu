// Integration tests: require DATABASE_URL (e.g. `npm run db:up && npm run db:migrate`).
import "dotenv/config";
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
after(() => db.$disconnect());

async function anyRestaurantId() {
  const r = await db.restaurant.findFirstOrThrow({ select: { id: true } });
  return r.id;
}

test("database rejects ratings outside 1–5 even when the app is bypassed", async () => {
  const restaurantId = await anyRestaurantId();
  for (const rating of [0, 6]) {
    await assert.rejects(
      db.vote.create({
        data: { restaurantId, tiramisuType: "CLASSIC", presentationRating: rating, tasteRating: 3, overallRating: 3, isTest: true },
      }),
      `rating ${rating} should violate the CHECK constraint`,
    );
  }
});

test("restaurants with votes cannot be hard-deleted", async () => {
  const restaurantId = await anyRestaurantId();
  const vote = await db.vote.create({
    data: { restaurantId, tiramisuType: "CREATIVE", presentationRating: 3, tasteRating: 3, overallRating: 3, isTest: true },
  });
  try {
    await assert.rejects(db.restaurant.delete({ where: { id: restaurantId } }));
  } finally {
    await db.vote.delete({ where: { id: vote.id } });
  }
});

test("campaign window must close after it opens", async () => {
  await assert.rejects(
    db.$executeRaw`UPDATE "CampaignSettings" SET "endDate" = "startDate" - interval '1 day' WHERE id = 1`,
  );
});

test("only a single settings row may exist", async () => {
  await assert.rejects(
    db.campaignSettings.create({ data: { id: 2, startDate: new Date(), endDate: new Date(Date.now() + 1000) } }),
  );
});
