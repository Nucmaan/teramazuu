import { Suspense } from "react";
import Link from "next/link";
import { Plus, QrCode } from "lucide-react";
import { db } from "@/lib/db";
import { canEdit, requireAdmin } from "@/lib/auth";
import { toggleRestaurant } from "@/app/admin/actions";
import { PageBody, PageHeader, PanelSkeleton } from "@/components/admin/page-header";
import { SmartImage } from "@/components/site/smart-image";
import { Badge, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Restaurants" };

export default function RestaurantsPage() {
  return (
    <>
      <PageHeader
        title="Restaurants"
        description="Participating venues shown on the homepage and ballot."
        actions={
          <Button variant="primary" asChild>
            <Link href="/admin/restaurants/new">
              <Plus aria-hidden /> Add restaurant
            </Link>
          </Button>
        }
      />
      <Suspense fallback={<PanelSkeleton />}>
        <RestaurantList />
      </Suspense>
    </>
  );
}

async function RestaurantList() {
  const admin = await requireAdmin();
  const editable = canEdit(admin);
  const restaurants = await db.restaurant.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { votes: { where: { isTest: false } } } } },
  });

  return (
    <PageBody>
      <Card className="divide-y divide-stone">
        {restaurants.length === 0 && <p className="p-10 text-center text-charcoal/55">No restaurants yet.</p>}
        {restaurants.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-[3px] bg-stone">
              {r.imageUrl && <SmartImage src={r.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-display text-xl text-espresso">
                {r.name}
                {r.isActive ? <Badge tone="green">Active</Badge> : <Badge>Disabled</Badge>}
              </p>
              <p className="mt-0.5 font-mono text-xs text-charcoal/50">/vote?restaurant={r.slug}</p>
            </div>
            <p className="w-24 text-sm tabular-nums text-charcoal/70">
              <span className="font-semibold text-espresso">{r._count.votes}</span> votes
            </p>
            <div className="flex gap-2">
              {editable && (
                <form action={toggleRestaurant.bind(null, r.id, !r.isActive)}>
                  <Button type="submit" variant="ghost" size="sm">
                    {r.isActive ? "Disable" : "Enable"}
                  </Button>
                </form>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/qr?restaurant=${r.id}`}>
                  <QrCode aria-hidden /> QR
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/restaurants/${r.id}`}>Edit</Link>
              </Button>
            </div>
          </div>
        ))}
      </Card>
      <p className="text-xs text-charcoal/55">
        Note: the official campaign poster lists different venues from the initial project brief. Confirm the final
        list with the Embassy and update it here.
      </p>
    </PageBody>
  );
}
