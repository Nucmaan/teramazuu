import { test } from "node:test";
import assert from "node:assert/strict";
import { voteSchema, voteSubmissionSchema } from "../lib/validation";
import { fromCampaignLocal, toCampaignLocalInput, campaignDayKey, startOfCampaignDay } from "../lib/time";

const valid = { restaurant: "la-terrazza", tiramisuType: "CLASSIC", presentationRating: 4, tasteRating: 5, overallRating: 3 };

test("accepts a complete vote", () => {
  assert.equal(voteSchema.safeParse(valid).success, true);
});

test("rejects ratings outside 1–5 and non-integers", () => {
  for (const bad of [0, 6, -1, 2.5, "4", null]) {
    assert.equal(voteSchema.safeParse({ ...valid, tasteRating: bad }).success, false, `rating ${bad}`);
  }
});

test("rejects unknown Tiramisù types", () => {
  assert.equal(voteSchema.safeParse({ ...valid, tiramisuType: "VEGAN" }).success, false);
});

test("rejects malformed restaurant slugs", () => {
  for (const slug of ["", "La Terrazza", "x'; drop table", "a".repeat(81)]) {
    assert.equal(voteSchema.safeParse({ ...valid, restaurant: slug }).success, false, slug);
  }
});

test("rejects missing answers", () => {
  assert.equal(voteSchema.safeParse({ ...valid, overallRating: undefined }).success, false);
});

test("submission schema defaults token and honeypot", () => {
  const r = voteSubmissionSchema.parse(valid);
  assert.equal(r.turnstileToken, "");
  assert.equal(r.website, "");
});

test("Mogadishu wall time converts to UTC (+03:00) and back", () => {
  const d = fromCampaignLocal("2026-10-30T00:00")!;
  assert.equal(d.toISOString(), "2026-10-29T21:00:00.000Z");
  assert.equal(toCampaignLocalInput(d), "2026-10-30T00:00");
});

test("campaign day boundaries follow Mogadishu, not UTC", () => {
  // 22:30 UTC on 29 Oct is already 01:30 on 30 Oct in Mogadishu.
  const late = new Date("2026-10-29T22:30:00Z");
  assert.equal(campaignDayKey(late), "2026-10-30");
  assert.equal(startOfCampaignDay(late).toISOString(), "2026-10-29T21:00:00.000Z");
});

test("rejects malformed local datetimes", () => {
  assert.equal(fromCampaignLocal("30/10/2026"), null);
});
