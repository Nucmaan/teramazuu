"use client";

import { useActionState, useState } from "react";
import { Check, Loader2, Upload } from "lucide-react";
import type { FormState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { SmartImage } from "@/components/site/smart-image";
import { slugify, cn } from "@/lib/utils";

// Licensed placeholder photography bundled with the site.
const LIBRARY = ["r1", "r2", "r3", "r4", "classic", "creative", "story-slice", "history-pan", "cups"].map(
  (n) => `/images/photo/${n}.jpg`,
);

type Restaurant = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

export function RestaurantForm({
  action,
  initial,
  submitLabel,
  canEdit,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  initial?: Restaurant;
  submitLabel: string;
  canEdit: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [image, setImage] = useState(initial?.imageUrl ?? "");
  const [active, setActive] = useState(initial?.isActive ?? true);
  const e = state.errors ?? {};

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <fieldset disabled={!canEdit} className="space-y-5">
        <Field label="Name" htmlFor="name" error={e.name}>
          <Input
            id="name"
            name="name"
            required
            value={name}
            aria-invalid={!!e.name}
            onChange={(ev) => {
              setName(ev.target.value);
              if (!slugTouched) setSlug(slugify(ev.target.value));
            }}
          />
        </Field>
        <Field label="URL slug" htmlFor="slug" error={e.slug} hint={`QR link: /vote?restaurant=${slug || "…"}`}>
          <Input
            id="slug"
            name="slug"
            value={slug}
            aria-invalid={!!e.slug}
            onChange={(ev) => {
              setSlugTouched(true);
              setSlug(ev.target.value.toLowerCase());
            }}
          />
        </Field>
        <Field
          label="Description"
          htmlFor="description"
          error={e.description}
          hint="Shown on the homepage card. Use copy approved by the restaurant — leave empty if none."
        >
          <Textarea id="description" name="description" defaultValue={initial?.description} maxLength={600} rows={4} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Display order" htmlFor="sortOrder" error={e.sortOrder} hint="Lower numbers appear first.">
            <Input id="sortOrder" name="sortOrder" type="number" min={0} max={999} defaultValue={initial?.sortOrder ?? 0} />
          </Field>
          <div className="space-y-1.5">
            <span className="text-[0.8125rem] font-medium text-espresso" id="active-label">
              Participating
            </span>
            <div className="flex h-10 items-center gap-3">
              <Switch name="isActive" checked={active} onCheckedChange={setActive} aria-labelledby="active-label" />
              <span className="text-sm text-charcoal/60">{active ? "Shown on the site and ballot" : "Hidden"}</span>
            </div>
          </div>
        </div>

        <Field label="Image URL" htmlFor="imageUrl" error={e.imageUrl} hint="Upload below, pick from the library, or paste an https:// URL.">
          <Input id="imageUrl" name="imageUrl" value={image} onChange={(ev) => setImage(ev.target.value)} />
        </Field>
        <div>
          <p className="mb-2 text-xs font-medium text-charcoal/60">Image library (licensed placeholders)</p>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-9">
            {LIBRARY.map((src) => (
              <button
                type="button"
                key={src}
                onClick={() => setImage(src)}
                aria-label={`Use ${src.split("/").pop()}`}
                aria-pressed={image === src}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-[3px] ring-offset-2 transition",
                  image === src ? "ring-2 ring-green" : "opacity-80 hover:opacity-100",
                )}
              >
                <SmartImage src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <Button type="submit" variant="primary" disabled={pending || !canEdit}>
            {pending && <Loader2 className="animate-spin" />}
            {submitLabel}
          </Button>
          {state.ok && (
            <p role="status" className="flex items-center gap-1.5 text-sm text-green-deep">
              <Check className="size-4" /> {state.message}
            </p>
          )}
          {!state.ok && state.message && <p role="alert" className="text-sm text-red-deep">{state.message}</p>}
        </div>
      </fieldset>

      <aside>
        <p className="mb-2 text-xs font-medium text-charcoal/60">Preview</p>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[3px] bg-stone">
          {image && (image.startsWith("/") || image.startsWith("https://")) ? (
            <SmartImage src={image} alt="" fill sizes="320px" className="object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-sm text-charcoal/40">No image</div>
          )}
        </div>
        <p className="mt-3 font-display text-2xl text-espresso">{name || "Restaurant name"}</p>
      </aside>
    </form>
  );
}

export function ImageUploadForm({ action }: { action: (state: FormState, data: FormData) => Promise<FormState> }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <Field label="Upload a new photo" htmlFor="image" error={state.errors?.image} hint="JPEG, PNG, WebP or AVIF, up to 4 MB. Portrait (4:5) works best." className="flex-1">
        <Input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required className="h-auto py-2 file:mr-3 file:rounded-[3px] file:border-0 file:bg-stone file:px-3 file:py-1 file:text-sm" />
      </Field>
      <Button type="submit" variant="outline" disabled={pending} className="sm:mb-5">
        {pending ? <Loader2 className="animate-spin" /> : <Upload />}
        Upload
      </Button>
      {state.ok && <p role="status" className="text-sm text-green-deep sm:mb-7">{state.message}</p>}
    </form>
  );
}
