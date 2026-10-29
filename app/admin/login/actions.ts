"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, destroySession, verifyPassword } from "@/lib/auth";
import { getClientAddress, keyedHash } from "@/lib/security";

const loginSchema = z.object({
  email: z.email().max(200).transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1).max(200),
});

export type LoginState = { error?: string; email?: string };

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
// Equalise timing for unknown emails so accounts can't be enumerated.
const DUMMY_HASH = "scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA==$" + "A".repeat(86) + "==";

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  const email = String(formData.get("email") ?? "").slice(0, 200);
  if (!parsed.success) return { error: "Enter your email and password.", email };

  const address = await getClientAddress();
  const key = keyedHash("login", `${parsed.data.email}|${address}`);
  const since = new Date(Date.now() - WINDOW_MS);
  const attempts = await db.loginAttempt.count({ where: { key, createdAt: { gte: since } } });
  if (attempts >= MAX_ATTEMPTS) {
    return { error: "Too many attempts. Please wait 15 minutes and try again.", email };
  }

  const user = await db.adminUser.findUnique({ where: { email: parsed.data.email } });
  const ok = await verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) {
    await db.loginAttempt.create({ data: { key } });
    return { error: "That email and password don't match.", email };
  }

  await db.loginAttempt.deleteMany({ where: { OR: [{ key }, { createdAt: { lt: new Date(Date.now() - 86_400_000) } }] } });
  await db.adminSession.deleteMany({ where: { adminUserId: user.id, expiresAt: { lt: new Date() } } });
  await createSession(user.id);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
