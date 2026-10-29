import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { canEdit, isOwner, requireAdmin } from "@/lib/auth";
import { updateRestaurant, uploadRestaurantImage } from "@/app/admin/actions";
import { PageBody, PageHeader, PanelSkeleton } from "@/components/admin/page-header";
import { ImageUploadForm, RestaurantForm } from "@/components/admin/restaurant-form";
import { DeleteRestaurant } from "@/components/admin/delete-restaurant";
import { Card, CardHeader } from "@/components/ui/card";

export const metadata = { title: "Edit restaurant" };

export default function EditRestaurantPage({ params }: PageProps<"/admin/restaurants/[id]">) {
  return (
    <>
      <PageHeader
        title="Edit restaurant"
        actions={
          <Link href="/admin/restaurants" className="inline-flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-espresso">
            <ArrowLeft className="size-4" /> All restaurants
          </Link>
        }
      />
      <Suspense fallback={<PanelSkeleton />}>
        <EditRestaurant params={params} />
      </Suspense>
    </>
  );
}

async function EditRestaurant({ params }: { params: PageProps<"/admin/restaurants/[id]">["params"] }) {
  const admin = await requireAdmin();
  const { id } = await params;
  const r = await db.restaurant.findUnique({ where: { id } });
  if (!r) notFound();
  const editable = canEdit(admin);

  return (
    <PageBody>
      <Card className="p-6">
        <RestaurantForm action={updateRestaurant.bind(null, r.id)} initial={r} submitLabel="Save changes" canEdit={editable} />
      </Card>
      {editable && (
        <Card>
          <CardHeader title="Photography" description="Uploaded images are stored in the campaign database." />
          <div className="p-6">
            <ImageUploadForm action={uploadRestaurantImage.bind(null, r.id)} />
          </div>
        </Card>
      )}
      {isOwner(admin) && <DeleteRestaurant id={r.id} />}
    </PageBody>
  );
}
