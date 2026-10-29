"use client";

import { useState, useTransition } from "react";
import { purgeTestVotes } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

/** Two-step inline confirmation (no blocking browser dialogs). */
export function PurgeTestsButton({ count }: { count: number }) {
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (message) return <p className="self-center text-sm text-green-deep" role="status">{message}</p>;
  if (!confirming) {
    return (
      <Button variant="outline" onClick={() => setConfirming(true)}>
        Remove {count} test vote{count === 1 ? "" : "s"}
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-charcoal/70">Permanently remove test votes?</span>
      <Button
        variant="destructive"
        disabled={pending}
        onClick={() => start(async () => setMessage((await purgeTestVotes()).message ?? null))}
      >
        {pending ? "Removing…" : "Remove"}
      </Button>
      <Button variant="ghost" onClick={() => setConfirming(false)}>
        Cancel
      </Button>
    </div>
  );
}
