import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getCampaignSettings, getVotingStatus } from "@/lib/campaign";
import { getOverview, getRestaurantStats, getVotesOverTime } from "@/lib/admin-data";
import { PageBody, PageHeader, PanelSkeleton } from "@/components/admin/page-header";
import { Badge, Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RatingsChart, TypeSplitChart, VotesByRestaurantChart, VotesOverTimeChart, SERIES } from "@/components/admin/charts";

export const metadata = { title: "Overview" };

export default function OverviewPage() {
  return (
    <>
      <PageHeader
        title="Overview"
        description="Live results from the database. Test votes are excluded everywhere."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/vote?preview=1" target="_blank">
                Preview ballot
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/votes/export">Export CSV</Link>
            </Button>
          </>
        }
      />
      <Suspense fallback={<PanelSkeleton />}>
        <Overview />
      </Suspense>
    </>
  );
}

const fmtAvg = (n: number | null) => (n == null ? "—" : n.toFixed(2));

async function Overview() {
  await requireAdmin();
  await connection();
  const settings = await getCampaignSettings();
  const [o, stats, overTime] = await Promise.all([
    getOverview(),
    getRestaurantStats(),
    getVotesOverTime(settings.startDate, settings.endDate),
  ]);
  const status = getVotingStatus(settings);
  const typeTotal = o.classic + o.creative;

  const statusBadge = {
    open: <Badge tone="green">Voting open</Badge>,
    paused: <Badge tone="red">Voting paused</Badge>,
  }[status];

  return (
    <PageBody>
      <div className="flex flex-wrap items-center gap-3 text-sm text-charcoal/60">
        {statusBadge}
        {o.tests > 0 && <span>· {o.tests} test vote{o.tests === 1 ? "" : "s"} hidden</span>}
      </div>

      <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total votes" value={o.total.toLocaleString("en-GB")} hero />
        <Stat label="Votes today" value={o.today.toLocaleString("en-GB")} note="Since 00:00 Mogadishu" />
        <Stat label="Participating restaurants" value={String(o.restaurants)} note="Currently active" />
        <Card className="p-5">
          <p className="text-[0.75rem] font-medium text-charcoal/60">Classic vs Creative</p>
          <p className="mt-2 font-display text-[2rem] leading-none text-espresso tabular-nums">
            {o.classic} <span className="text-charcoal/30">/</span> {o.creative}
          </p>
          <div className="mt-3 flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-stone" aria-hidden>
            {typeTotal > 0 && (
              <>
                <span style={{ width: `${(o.classic / typeTotal) * 100}%`, background: SERIES.classic }} />
                <span style={{ width: `${(o.creative / typeTotal) * 100}%`, background: SERIES.creative }} />
              </>
            )}
          </div>
          <p className="mt-2 text-xs text-charcoal/55">
            {typeTotal ? `${Math.round((o.classic / typeTotal) * 100)}% classic · ${Math.round((o.creative / typeTotal) * 100)}% creative` : "No votes yet"}
          </p>
        </Card>
      </section>

      <section aria-label="Average scores" className="grid gap-4 sm:grid-cols-3">
        <Stat label="Average presentation" value={fmtAvg(o.avgPresentation)} suffix="/ 5" />
        <Stat label="Average taste" value={fmtAvg(o.avgTaste)} suffix="/ 5" />
        <Stat label="Average overall experience" value={fmtAvg(o.avgOverall)} suffix="/ 5" />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Votes over time" description="Per day, Mogadishu time" />
          <div className="p-5">
            <VotesOverTimeChart data={overTime} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Votes by restaurant" />
          <div className="p-5">
            <VotesByRestaurantChart data={stats.map((s) => ({ name: s.name, votes: s.votes }))} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Average ratings by restaurant" description="Compare presentation, taste and overall experience (scale 1–5)" />
        <div className="p-5">
          <RatingsChart data={stats} />
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Classic vs Creative" description="Distribution by restaurant" />
          <div className="p-5">
            <TypeSplitChart data={stats.map((s) => ({ name: s.name, classic: s.classic, creative: s.creative }))} />
          </div>
        </Card>
        <Card>
          <CardHeader title="Restaurant summary" description="The same figures as a table" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone text-left text-[0.6875rem] uppercase tracking-[0.08em] text-charcoal/55">
                  <th scope="col" className="px-5 py-3 font-semibold">Restaurant</th>
                  <th scope="col" className="px-3 py-3 text-right font-semibold">Votes</th>
                  <th scope="col" className="px-3 py-3 text-right font-semibold">Pres.</th>
                  <th scope="col" className="px-3 py-3 text-right font-semibold">Taste</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">Overall</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((s) => (
                  <tr key={s.id} className="border-b border-stone/70 last:border-0">
                    <th scope="row" className="px-5 py-3 text-left font-medium text-espresso">
                      {s.name}
                      {!s.isActive && <span className="ml-2 text-xs font-normal text-charcoal/45">(disabled)</span>}
                    </th>
                    <td className="px-3 py-3 text-right tabular-nums">{s.votes}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{fmtAvg(s.presentation)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{fmtAvg(s.taste)}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{fmtAvg(s.overall)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PageBody>
  );
}

function Stat({ label, value, note, suffix, hero }: { label: string; value: string; note?: string; suffix?: string; hero?: boolean }) {
  return (
    <Card className={hero ? "border-espresso bg-espresso p-5 text-ivory" : "p-5"}>
      <p className={hero ? "text-[0.75rem] font-medium text-ivory/65" : "text-[0.75rem] font-medium text-charcoal/60"}>{label}</p>
      <p className={hero ? "mt-2 font-display text-[2.75rem] leading-none tabular-nums" : "mt-2 font-display text-[2rem] leading-none text-espresso tabular-nums"}>
        {value}
        {suffix && <span className="ml-1.5 font-sans text-sm text-charcoal/45">{suffix}</span>}
      </p>
      {note && <p className={hero ? "mt-2 text-xs text-ivory/55" : "mt-2 text-xs text-charcoal/55"}>{note}</p>}
    </Card>
  );
}
