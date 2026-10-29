import { Suspense } from "react";
import { canEdit, requireAdmin } from "@/lib/auth";
import { createRestaurant } from "@/app/admin/actions";
import { PageBody, PageHeader, PanelSkeleton } from "@/components/admin/page-header";
import { RestaurantForm } from "@/components/admin/restaurant-form";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Add restaurant" };

export default function NewRestaurantPage() {
  return (
    <>
      <PageHeader title="Add restaurant" />
      <Suspense fallback={<PanelSkeleton />}>
        <NewRestaurant />
      </Suspense>
    </>
  );
}

async function NewRestaurant() {
  const admin = await requireAdmin("EDITOR");
  return (
    <PageBody>
      <Card className="p-6">
        <RestaurantForm action={createRestaurant} submitLabel="Create restaurant" canEdit={canEdit(admin)} />
      </Card>
    </PageBody>
  );
}
