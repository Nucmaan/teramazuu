import { z } from "zod";

export const RATING_LABELS = {
  1: "Awful",
  2: "Not Very Good",
  3: "Okay",
  4: "Really Good",
  5: "Fantastic",
} as const;

export const TIRAMISU_TYPES = ["CLASSIC", "CREATIVE"] as const;

const rating = z
  .number({ error: "Please choose a rating." })
  .int()
  .min(1, "Please choose a rating.")
  .max(5, "Please choose a rating.");

export const voteSchema = z.object({
  restaurant: z
    .string({ error: "Please choose a restaurant." })
    .min(1, "Please choose a restaurant.")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Please choose a restaurant."),
  tiramisuType: z.enum(TIRAMISU_TYPES, { error: "Please choose a Tiramisù." }),
  presentationRating: rating,
  tasteRating: rating,
  overallRating: rating,
});

export type VoteInput = z.infer<typeof voteSchema>;

export const voteSubmissionSchema = voteSchema.extend({
  turnstileToken: z.string().max(4096).optional().default(""),
  /** Honeypot — real visitors never see or fill this field. */
  website: z.string().max(200).optional().default(""),
});
