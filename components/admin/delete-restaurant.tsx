"use client";

import { useState, useTransition } from "react";
import { deleteRestaurant } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function DeleteRestaurant({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <Card className="flex flex-wrap items-center justify-between gap-4 border-red/20 p-5">
      <div>
        <p className="text-sm font-semibold text-espresso">Delete restaurant</p>
        <p className="text-sm text-charcoal/60">{message ?? "Only possible when it has no votes. Otherwise, disable it."}</p>
      </div>
      {confirming ? (
        <div className="flex gap-2">
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() => start(async () => setMessage((await deleteRestaurant(id))?.message ?? null))}
          >
            {pending ? "Deleting…" : "Confirm delete"}
          </Button>
          <Button variant="ghost" onClick={() => setConfirming(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button variant="outline" onClick={() => setConfirming(true)}>
          Delete…
        </Button>
      )}
    </Card>
  );
}
