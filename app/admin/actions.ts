"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertAdmin, hashPassword, verifyPassword } from "@/lib/auth";
import { DEFAULT_WINDOW, TAGS } from "@/lib/campaign";
import { slugify } from "@/lib/utils";

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string> };

function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}

const bool = (v: FormDataEntryValue | null) => v === "on" || v === "true";

// ── Restaurants ───────────────────────────────────────────────

const imageUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || v.startsWith("/images/") || v.startsWith("/media/") || /^https:\/\/[^\s]+$/.test(v), {
    message: "Use an uploaded image, a bundled /images/ path, or an https:// URL.",
  });

const restaurantSchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(80),
  slug: z
    .string()
    .trim()
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens."),
  description: z.string().trim().max(600, "Keep the description under 600 characters."),
  imageUrl,
  sortOrder: z.coerce.number().int().min(0).max(999),
  isActive: z.boolean(),
});

function readRestaurant(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  return restaurantSchema.safeParse({
    name,
    slug: String(formData.get("slug") ?? "") || slugify(name),
    description: String(formData.get("description") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? ""),
    sortOrder: formData.get("sortOrder") ?? 0,
    isActive: bool(formData.get("isActive")),
  });
}

function invalidateRestaurants() {
  updateTag(TAGS.restaurants);
  updateTag(TAGS.results);
}

export async function createRestaurant(_: FormState, formData: FormData): Promise<FormState> {
  await assertAdmin("EDITOR");
  const parsed = readRestaurant(formData);
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  if (await db.restaurant.findUnique({ where: { slug: parsed.data.slug } })) {
    return { errors: { slug: "Another restaurant already uses this slug." } };
  }
  const created = await db.restaurant.create({ data: { ...parsed.data, imageUrl: parsed.data.imageUrl || null } });
  invalidateRestaurants();
  redirect(`/admin/restaurants/${created.id}?created=1`);
}

export async function updateRestaurant(id: string, _: FormState, formData: FormData): Promise<FormState> {
  await assertAdmin("EDITOR");
  const parsed = readRestaurant(formData);
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const clash = await db.restaurant.findFirst({ where: { slug: parsed.data.slug, NOT: { id } } });
  if (clash) return { errors: { slug: "Another restaurant already uses this slug." } };
  await db.restaurant.update({ where: { id }, data: { ...parsed.data, imageUrl: parsed.data.imageUrl || null } });
  invalidateRestaurants();
  return { ok: true, message: "Restaurant saved." };
}

export async function toggleRestaurant(id: string, isActive: boolean) {
  await assertAdmin("EDITOR");
  await db.restaurant.update({ where: { id }, data: { isActive } });
  invalidateRestaurants();
}

export async function deleteRestaurant(id: string): Promise<FormState> {
  await assertAdmin("OWNER");
  const votes = await db.vote.count({ where: { restaurantId: id } });
  if (votes > 0) {
    return { message: `This restaurant has ${votes} vote${votes === 1 ? "" : "s"}. Disable it instead to keep the record intact.` };
  }
  await db.restaurant.delete({ where: { id } });
  invalidateRestaurants();
  redirect("/admin/restaurants");
}

// ── Images ────────────────────────────────────────────────────

const MAX_BYTES = 4 * 1024 * 1024;

function sniffImage(bytes: Uint8Array): string | null {
  const b = bytes;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP") return "image/webp";
  if (String.fromCharCode(...b.slice(4, 12)).startsWith("ftypavi")) return "image/avif";
  return null;
}

export async function uploadRestaurantImage(id: string, _: FormState, formData: FormData): Promise<FormState> {
  await assertAdmin("EDITOR");
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { errors: { image: "Choose an image to upload." } };
  if (file.size > MAX_BYTES) return { errors: { image: "Images must be 4 MB or smaller." } };
  const bytes = new Uint8Array(await file.arrayBuffer());
  // Trust the file's content, not its name or declared type.
  const mimeType = sniffImage(bytes);
  if (!mimeType) return { errors: { image: "Upload a JPEG, PNG, WebP or AVIF image." } };

  const asset = await db.mediaAsset.create({
    data: { filename: file.name.slice(0, 120), mimeType, byteSize: bytes.byteLength, data: bytes },
    select: { id: true },
  });
  await db.restaurant.update({ where: { id }, data: { imageUrl: `/media/${asset.id}` } });
  invalidateRestaurants();
  return { ok: true, message: "Image uploaded and applied." };
}

// ── Campaign settings ─────────────────────────────────────────

const settingsSchema = z.object({
    title: z.string().trim().min(3).max(120),
    votingEnabled: z.boolean(),
    heroIntro: z.string().trim().min(10).max(400),
    maxVotesPerDevicePerRestaurant: z.coerce.number().int().min(0).max(50),
    maxVotesPerNetworkPerHour: z.coerce.number().int().min(0).max(10_000),
    requireBotCheck: z.boolean(),
  });

export async function saveSettings(_: FormState, formData: FormData): Promise<FormState> {
  await assertAdmin("OWNER");
  const parsed = settingsSchema.safeParse({
    title: formData.get("title"),
    votingEnabled: bool(formData.get("votingEnabled")),
    heroIntro: formData.get("heroIntro"),
    maxVotesPerDevicePerRestaurant: formData.get("maxVotesPerDevicePerRestaurant"),
    maxVotesPerNetworkPerHour: formData.get("maxVotesPerNetworkPerHour"),
    requireBotCheck: bool(formData.get("requireBotCheck")),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  await db.campaignSettings.upsert({ where: { id: 1 }, update: parsed.data, create: { id: 1, ...DEFAULT_WINDOW, ...parsed.data } });
  updateTag(TAGS.campaign);
  updateTag(TAGS.results);
  return { ok: true, message: "Campaign settings saved." };
}

// ── Votes ─────────────────────────────────────────────────────

export async function purgeTestVotes(): Promise<FormState> {
  await assertAdmin("OWNER");
  const { count } = await db.vote.deleteMany({ where: { isTest: true } });
  return { ok: true, message: `Removed ${count} test vote${count === 1 ? "" : "s"}.` };
}

export async function deleteVote(id: string) {
  await assertAdmin("OWNER");
  await db.vote.delete({ where: { id } });
  updateTag(TAGS.results);
}

// ── Administrators ────────────────────────────────────────────

const newAdminSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email("Enter a valid email.").max(200).transform((v) => v.toLowerCase()),
  role: z.enum(["OWNER", "EDITOR", "VIEWER"]),
  password: z.string().min(12, "Use at least 12 characters.").max(200),
});

export async function createAdminUser(_: FormState, formData: FormData): Promise<FormState> {
  await assertAdmin("OWNER");
  const parsed = newAdminSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  if (await db.adminUser.findUnique({ where: { email: parsed.data.email } })) {
    return { errors: { email: "An administrator with this email already exists." } };
  }
  const { password, ...rest } = parsed.data;
  await db.adminUser.create({ data: { ...rest, passwordHash: await hashPassword(password) } });
  return { ok: true, message: `${rest.name} can now sign in.` };
}

export async function removeAdminUser(id: string): Promise<FormState> {
  const me = await assertAdmin("OWNER");
  if (id === me.id) return { message: "You can't remove your own account." };
  await db.adminUser.delete({ where: { id } });
  return { ok: true };
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password."),
    next: z.string().min(12, "Use at least 12 characters.").max(200),
  })
  .refine((v) => v.current !== v.next, { path: ["next"], message: "Choose a different password." });

export async function changePassword(_: FormState, formData: FormData): Promise<FormState> {
  const me = await assertAdmin("VIEWER");
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const user = await db.adminUser.findUniqueOrThrow({ where: { id: me.id } });
  if (!(await verifyPassword(parsed.data.current, user.passwordHash))) {
    return { errors: { current: "That isn't your current password." } };
  }
  await db.adminUser.update({ where: { id: me.id }, data: { passwordHash: await hashPassword(parsed.data.next) } });
  // Sign out every other session for this account.
  await db.adminSession.deleteMany({ where: { adminUserId: me.id } });
  redirect("/admin/login");
}
