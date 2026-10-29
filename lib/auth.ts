import "server-only";
import { cache } from "react";
import { scrypt, timingSafeEqual, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { randomToken, sha256 } from "@/lib/security";
import type { AdminRole } from "@/lib/generated/prisma/enums";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

export const SESSION_COOKIE = "scim_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
const SCRYPT = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password.normalize("NFKC"), salt, 64, SCRYPT);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [algo, n, r, p, salt, hash] = stored.split("$");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const key = await scryptAsync(password.normalize("NFKC"), Buffer.from(salt, "base64"), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: SCRYPT.maxmem,
  });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

export async function createSession(adminUserId: string) {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.adminSession.create({ data: { tokenHash: sha256(token), adminUserId, expiresAt } });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.adminSession.deleteMany({ where: { tokenHash: sha256(token) } });
  store.delete(SESSION_COOKIE);
}

export type Admin = { id: string; name: string; email: string; role: AdminRole };

/** Verified admin for this request, or null. Deduplicated per render. */
export const getAdmin = cache(async (): Promise<Admin | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.adminSession.findUnique({
    where: { tokenHash: sha256(token) },
    include: { adminUser: { select: { id: true, name: true, email: true, role: true } } },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.adminUser;
});

const RANK: Record<AdminRole, number> = { VIEWER: 0, EDITOR: 1, OWNER: 2 };

/** For pages: redirect to login when unauthenticated. */
export async function requireAdmin(minRole: AdminRole = "VIEWER") {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  if (RANK[admin.role] < RANK[minRole]) redirect("/admin?denied=1");
  return admin;
}

/** For server actions / route handlers: throw instead of redirecting. */
export async function assertAdmin(minRole: AdminRole = "VIEWER") {
  const admin = await getAdmin();
  if (!admin || RANK[admin.role] < RANK[minRole]) {
    throw new Error("Not authorized");
  }
  return admin;
}

export function canEdit(admin: Admin) {
  return RANK[admin.role] >= RANK.EDITOR;
}
export function isOwner(admin: Admin) {
  return admin.role === "OWNER";
}
