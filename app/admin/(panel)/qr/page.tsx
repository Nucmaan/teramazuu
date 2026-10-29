import { Suspense } from "react";
import QRCode from "qrcode";
import { AlertTriangle } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getCampaignSettings } from "@/lib/campaign";
import { formatCampaignDate } from "@/lib/time";
import { siteUrl } from "@/lib/utils";
import { PageBody, PageHeader, PanelSkeleton } from "@/components/admin/page-header";
import { PrintButton } from "@/components/admin/print-button";
import { Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export const metadata = { title: "QR codes" };

export default function QrPage({ searchParams }: PageProps<"/admin/qr">) {
  return (
    <>
      <PageHeader
        title="QR codes"
        description="Printable table cards. Each code opens the ballot with the restaurant preselected."
        actions={<PrintButton />}
      />
      <Suspense fallback={<PanelSkeleton />}>
        <QrSheet searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function QrSheet({ searchParams }: { searchParams: PageProps<"/admin/qr">["searchParams"] }) {
  await requireAdmin();
  const sp = await searchParams;
  const only = typeof sp.restaurant === "string" ? sp.restaurant : undefined;
  const [all, settings] = await Promise.all([
    db.restaurant.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    getCampaignSettings(),
  ]);
  const restaurants = only ? all.filter((r) => r.id === only) : all;
  const base = siteUrl();
  const isLocal = /localhost|127\.0\.0\.1/.test(base);

  const cards = await Promise.all(
    restaurants.map(async (r) => {
      const url = siteUrl(`/vote?restaurant=${r.slug}`);
      const svg = await QRCode.toString(url, {
        type: "svg",
        errorCorrectionLevel: "Q",
        margin: 0,
        color: { dark: "#30221C", light: "#00000000" },
      });
      return { ...r, url, svg, dataUri: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` };
    }),
  );

  return (
    <PageBody>
      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <form method="get" className="flex items-end gap-2">
          <label>
            <span className="mb-1.5 block text-xs font-medium text-charcoal/60">Restaurant</span>
            <Select name="restaurant" defaultValue={only ?? ""} className="min-w-56">
              <option value="">All active restaurants</option>
              {all.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </label>
          <Button type="submit" variant="outline">
            Show
          </Button>
        </form>
        <p className="text-sm text-charcoal/60">
          Links point to <span className="font-mono text-espresso">{base}</span>
        </p>
      </div>

      {isLocal && (
        <p className="flex items-start gap-2 rounded-[3px] border border-gold/40 bg-gold/10 p-3 text-sm text-cocoa print:hidden">
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
          NEXT_PUBLIC_SITE_URL is set to a local address. Set it to the production domain before printing — these codes
          won&rsquo;t work on visitors&rsquo; phones.
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 print:grid-cols-2 print:gap-4">
        {cards.map((c) => (
          <div key={c.id} className="break-inside-avoid">
            <article className="relative flex aspect-[105/148] flex-col items-center justify-between overflow-hidden bg-[#f8f5ef] px-8 pb-6 pt-8 text-center shadow-[0_1px_0_rgba(0,0,0,0.04),0_12px_32px_-18px_rgba(30,21,17,0.35)] print:shadow-none print:outline print:outline-1 print:outline-[#ddd]">
              <div>
                <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.28em] text-[#30221c]/60">
                  Week of Italian Cuisine in the World
                </p>
                <p className="mt-3 font-display text-[1.75rem] leading-none text-[#30221c]">
                  Taste<span className="text-[#008c45]">,</span> Click <span className="italic text-[#cd212a]">&amp;</span> Vote
                </p>
                <span aria-hidden className="tricolore mx-auto mt-3 block h-[2px] w-16" />
              </div>

              <div className="w-[62%]">
                <div className="aspect-square w-full [&_svg]:h-full [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: c.svg }} />
                <p className="mt-4 text-[0.625rem] font-semibold uppercase tracking-[0.24em] text-[#30221c]">Scan to vote</p>
              </div>

              <div className="w-full">
                <p className="font-display text-[1.375rem] leading-tight text-[#30221c]">{c.name}</p>
                <p className="mt-1 text-[0.6875rem] text-[#30221c]/60">
                  {formatCampaignDate(settings.startDate, { year: undefined })} — {formatCampaignDate(settings.endDate)}
                </p>
                <p className="mt-2 text-[0.5625rem] uppercase tracking-[0.2em] text-[#30221c]/50">
                  Embassy of Italy · Mogadishu · #SCIM2026
                </p>
              </div>
              <div aria-hidden className="absolute inset-x-0 bottom-0 grid h-1.5 grid-cols-3">
                <span className="bg-[#008c45]" />
                <span className="bg-[#eae6de]" />
                <span className="bg-[#cd212a]" />
              </div>
            </article>
            <div className="mt-2 flex items-center justify-between gap-2 text-xs print:hidden">
              <span className="truncate font-mono text-charcoal/50">{c.url}</span>
              <a href={c.dataUri} download={`qr-${c.slug}.svg`} className="shrink-0 font-medium text-green-deep hover:underline">
                Download SVG
              </a>
            </div>
          </div>
        ))}
      </div>
      {cards.length === 0 && <p className="text-charcoal/55">No active restaurants.</p>}
    </PageBody>
  );
}
