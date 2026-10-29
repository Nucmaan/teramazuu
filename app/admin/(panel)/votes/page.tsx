import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, Search, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { isOwner, requireAdmin } from "@/lib/auth";
import { listVotes, type VoteFilters } from "@/lib/admin-data";
import { formatCampaignDateTime } from "@/lib/time";
import { deleteVote } from "@/app/admin/actions";
import { PageBody, PageHeader, PanelSkeleton } from "@/components/admin/page-header";
import { PurgeTestsButton } from "@/components/admin/purge-tests";
import { Badge, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";

export const metadata = { title: "Votes" };

export default function VotesPage({ searchParams }: PageProps<"/admin/votes">) {
  return (
    <>
      <PageHeader title="Votes" description="Every submitted vote. Filter, search and export." />
      <Suspense fallback={<PanelSkeleton />}>
        <Votes searchParams={searchParams} />
      </Suspense>
    </>
  );
}

function toFilters(sp: Record<string, string | string[] | undefined>): VoteFilters {
  const pick = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  return {
    q: pick("q"),
    restaurant: pick("restaurant"),
    type: pick("type"),
    minOverall: pick("minOverall"),
    from: pick("from"),
    to: pick("to"),
    tests: pick("tests"),
    page: pick("page"),
  };
}

function qs(f: VoteFilters, patch: Partial<VoteFilters> = {}) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...f, ...patch })) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `?${s}` : "";
}

async function Votes({ searchParams }: { searchParams: PageProps<"/admin/votes">["searchParams"] }) {
  const admin = await requireAdmin();
  const filters = toFilters(await searchParams);
  const [{ rows, total, page, pages }, restaurants, testCount] = await Promise.all([
    listVotes(filters),
    db.restaurant.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.vote.count({ where: { isTest: true } }),
  ]);
  const owner = isOwner(admin);
  const exportHref = `/admin/votes/export${qs({ ...filters, page: undefined })}`;

  return (
    <PageBody>
      <Card className="p-4">
        <form method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(6,minmax(0,1fr))_auto] lg:items-end">
          <label className="relative block">
            <span className="mb-1.5 block text-xs font-medium text-charcoal/60">Search</span>
            <Search aria-hidden className="pointer-events-none absolute bottom-3 left-3 size-4 text-charcoal/40" />
            <Input name="q" defaultValue={filters.q} placeholder="Restaurant or vote ID" className="pl-9" />
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-medium text-charcoal/60">Restaurant</span>
            <Select name="restaurant" defaultValue={filters.restaurant ?? ""}>
              <option value="">All</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-medium text-charcoal/60">Tiramisù</span>
            <Select name="type" defaultValue={filters.type ?? ""}>
              <option value="">All</option>
              <option value="CLASSIC">Classic</option>
              <option value="CREATIVE">Creative</option>
            </Select>
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-medium text-charcoal/60">Overall ≥</span>
            <Select name="minOverall" defaultValue={filters.minOverall ?? ""}>
              <option value="">Any</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-medium text-charcoal/60">From</span>
            <Input type="date" name="from" defaultValue={filters.from} />
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-medium text-charcoal/60">To</span>
            <Input type="date" name="to" defaultValue={filters.to} />
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-medium text-charcoal/60">Test votes</span>
            <Select name="tests" defaultValue={filters.tests ?? ""}>
              <option value="">Exclude</option>
              <option value="include">Include</option>
              <option value="only">Only tests</option>
            </Select>
          </label>
          <div className="flex gap-2">
            <Button type="submit">Apply</Button>
            <Button variant="ghost" asChild>
              <Link href="/admin/votes">Reset</Link>
            </Button>
          </div>
        </form>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-charcoal/60">
          {total.toLocaleString("en-GB")} vote{total === 1 ? "" : "s"} · page {page} of {pages}
        </p>
        <div className="flex gap-2">
          {owner && testCount > 0 && <PurgeTestsButton count={testCount} />}
          <Button variant="outline" asChild>
            <a href={exportHref}>
              <Download aria-hidden />
              Export CSV
            </a>
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-sm">
            <caption className="sr-only">Votes</caption>
            <thead className="bg-ivory/70">
              <tr className="border-b border-stone text-left text-[0.6875rem] uppercase tracking-[0.08em] text-charcoal/55">
                <th scope="col" className="px-5 py-3 font-semibold">Restaurant</th>
                <th scope="col" className="px-3 py-3 font-semibold">Tiramisù</th>
                <th scope="col" className="px-3 py-3 text-center font-semibold">Presentation</th>
                <th scope="col" className="px-3 py-3 text-center font-semibold">Taste</th>
                <th scope="col" className="px-3 py-3 text-center font-semibold">Overall</th>
                <th scope="col" className="px-3 py-3 font-semibold">Submitted (Mogadishu)</th>
                {owner && <th scope="col" className="px-5 py-3"><span className="sr-only">Actions</span></th>}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={owner ? 7 : 6} className="px-5 py-14 text-center text-charcoal/50">
                    No votes match these filters.
                  </td>
                </tr>
              )}
              {rows.map((v) => (
                <tr key={v.id} className="border-b border-stone/70 last:border-0 hover:bg-ivory/50">
                  <th scope="row" className="px-5 py-3 text-left font-medium text-espresso">
                    {v.restaurant.name}
                    {v.isTest && <Badge tone="gold" className="ml-2">Test</Badge>}
                    <span className="block font-mono text-[0.6875rem] font-normal text-charcoal/40">{v.id}</span>
                  </th>
                  <td className="px-3 py-3">
                    <Badge tone={v.tiramisuType === "CLASSIC" ? "green" : "neutral"}>
                      {v.tiramisuType === "CLASSIC" ? "Classic" : "Creative"}
                    </Badge>
                  </td>
                  <Score n={v.presentationRating} />
                  <Score n={v.tasteRating} />
                  <Score n={v.overallRating} />
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums text-charcoal/70">{formatCampaignDateTime(v.createdAt)}</td>
                  {owner && (
                    <td className="px-5 py-3 text-right">
                      <form action={deleteVote.bind(null, v.id)}>
                        <Button type="submit" variant="ghost" size="icon" aria-label={`Delete vote ${v.id}`} className="text-charcoal/40 hover:text-red">
                          <Trash2 />
                        </Button>
                      </form>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <nav aria-label="Pagination" className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" asChild={page > 1} disabled={page <= 1}>
          {page > 1 ? (
            <Link href={`/admin/votes${qs(filters, { page: String(page - 1) })}`}>
              <ChevronLeft aria-hidden /> Previous
            </Link>
          ) : (
            <span>
              <ChevronLeft aria-hidden /> Previous
            </span>
          )}
        </Button>
        <Button variant="outline" size="sm" asChild={page < pages} disabled={page >= pages}>
          {page < pages ? (
            <Link href={`/admin/votes${qs(filters, { page: String(page + 1) })}`}>
              Next <ChevronRight aria-hidden />
            </Link>
          ) : (
            <span>
              Next <ChevronRight aria-hidden />
            </span>
          )}
        </Button>
      </nav>
    </PageBody>
  );
}

function Score({ n }: { n: number }) {
  const tone = n >= 4 ? "text-green-deep" : n === 3 ? "text-cocoa" : "text-red-deep";
  return (
    <td className="px-3 py-3 text-center">
      <span className={`font-semibold tabular-nums ${tone}`}>{n}</span>
      <span className="text-charcoal/35"> /5</span>
    </td>
  );
}
