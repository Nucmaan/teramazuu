import { db } from "@/lib/db";
import { getAdmin } from "@/lib/auth";
import { buildVoteWhere, type VoteFilters } from "@/lib/admin-data";
import { formatCampaignDateTime } from "@/lib/time";

// Neutralise spreadsheet formula injection and quote every cell.
function cell(value: string | number | boolean) {
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const admin = await getAdmin();
  if (!admin) return new Response("Unauthorized", { status: 401 });

  const params = Object.fromEntries(new URL(request.url).searchParams) as VoteFilters;
  const votes = await db.vote.findMany({
    where: buildVoteWhere(params),
    orderBy: { createdAt: "asc" },
    take: 100_000,
    select: {
      id: true,
      tiramisuType: true,
      presentationRating: true,
      tasteRating: true,
      overallRating: true,
      isTest: true,
      createdAt: true,
      restaurant: { select: { name: true, slug: true } },
    },
  });

  const header = ["Vote ID", "Restaurant", "Restaurant slug", "Tiramisu type", "Presentation", "Taste", "Overall", "Submitted (UTC)", "Submitted (Mogadishu)", "Test vote"];
  const lines = [header.map(cell).join(",")];
  for (const v of votes) {
    lines.push(
      [
        v.id,
        v.restaurant.name,
        v.restaurant.slug,
        v.tiramisuType === "CLASSIC" ? "Classic" : "Creative",
        v.presentationRating,
        v.tasteRating,
        v.overallRating,
        v.createdAt.toISOString(),
        formatCampaignDateTime(v.createdAt),
        v.isTest ? "yes" : "no",
      ]
        .map(cell)
        .join(","),
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="scim2026-votes-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
