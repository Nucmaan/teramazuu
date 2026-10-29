// Usage: npm run admin:create -- <email> <password> [OWNER|EDITOR|VIEWER] [name]
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import { PrismaClient } from "../lib/generated/prisma/client";

const scryptAsync = promisify(scrypt) as (p: string, s: Buffer, k: number, o: object) => Promise<Buffer>;

async function main() {
  const [email, password, role = "EDITOR", ...nameParts] = process.argv.slice(2);
  if (!email || !password) throw new Error("Usage: npm run admin:create -- <email> <password> [role] [name]");
  if (password.length < 12) throw new Error("Password must be at least 12 characters");
  if (!["OWNER", "EDITOR", "VIEWER"].includes(role)) throw new Error("Role must be OWNER, EDITOR or VIEWER");
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  const salt = randomBytes(16);
  const N = 2 ** 15;
  const key = await scryptAsync(password.normalize("NFKC"), salt, 64, { N, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  const passwordHash = `scrypt$${N}$8$1$${salt.toString("base64")}$${key.toString("base64")}`;
  const user = await db.adminUser.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash, role: role as "OWNER" },
    create: { email: email.toLowerCase(), passwordHash, role: role as "OWNER", name: nameParts.join(" ") || "Administrator" },
  });
  console.log(`Saved ${user.email} (${user.role}).`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
