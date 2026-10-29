import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import { PrismaClient } from "../lib/generated/prisma/client";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const scryptAsync = promisify(scrypt) as (p: string, s: Buffer, k: number, o: object) => Promise<Buffer>;

// The four restaurants named in the project brief. Descriptions are left empty
// on purpose — real copy must come from the venues / organiser.
// Images are licensed placeholder photography (Unsplash License) until each
// restaurant supplies its own.
const RESTAURANTS = [
  { name: "La Terrazza", slug: "la-terrazza", imageUrl: "/images/photo/r1.jpg" },
  { name: "La Trattoria", slug: "la-trattoria", imageUrl: "/images/photo/r2.jpg" },
  { name: "Pescatore", slug: "pescatore", imageUrl: "/images/photo/r3.jpg" },
  { name: "Spaghetti House", slug: "spaghetti-house", imageUrl: "/images/photo/r4.jpg" },
];

async function main() {
  for (const [i, r] of RESTAURANTS.entries()) {
    await db.restaurant.upsert({
      where: { slug: r.slug },
      update: {},
      create: { ...r, sortOrder: i },
    });
  }

  await db.campaignSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      // 30 Oct 2026 00:00 → 10 Nov 2026 23:59:59, Africa/Mogadishu (UTC+3)
      startDate: new Date("2026-10-29T21:00:00.000Z"),
      endDate: new Date("2026-11-10T20:59:59.000Z"),
    },
  });

  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");
    const existing = await db.adminUser.findUnique({ where: { email } });
    if (!existing) {
      const salt = randomBytes(16);
      const N = 2 ** 15;
      const key = await scryptAsync(password.normalize("NFKC"), salt, 64, { N, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
      await db.adminUser.create({
        data: {
          email,
          name: process.env.ADMIN_NAME ?? "Administrator",
          role: "OWNER",
          passwordHash: `scrypt$${N}$8$1$${salt.toString("base64")}$${key.toString("base64")}`,
        },
      });
      console.log(`Created owner account ${email}`);
    }
  } else {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin creation.");
  }
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
