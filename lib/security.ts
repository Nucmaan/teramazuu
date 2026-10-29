import "server-only";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { headers } from "next/headers";

function hashSecret() {
  const secret = process.env.VOTE_HASH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("VOTE_HASH_SECRET must be set to at least 32 characters");
  }
  return secret;
}

/** Keyed, non-reversible fingerprint. Raw identifiers are never persisted. */
export function keyedHash(scope: string, value: string) {
  return createHmac("sha256", hashSecret()).update(`${scope}:${value}`).digest("base64url");
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("base64url");
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

/** Best-effort client address; trust depends on the hosting proxy setup. */
export async function getClientAddress() {
  const h = await headers();
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export function botCheckConfigured() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

/** Server-side Cloudflare Turnstile verification. */
export async function verifyTurnstile(token: string, remoteIp?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;
  if (!token) return false;
  try {
    const body = new FormData();
    body.append("secret", secret);
    body.append("response", token);
    if (remoteIp && remoteIp !== "unknown") body.append("remoteip", remoteIp);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
