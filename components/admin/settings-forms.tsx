"use client";

import { useActionState, useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { changePassword, createAdminUser, removeAdminUser, saveSettings, type FormState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";

function Saved({ state }: { state: FormState }) {
  if (state.ok)
    return (
      <p role="status" className="flex items-center gap-1.5 text-sm text-green-deep">
        <Check className="size-4" /> {state.message}
      </p>
    );
  if (state.message) return <p role="alert" className="text-sm text-red-deep">{state.message}</p>;
  if (state.errors && Object.keys(state.errors).length) return <p role="alert" className="text-sm text-red-deep">Please fix the highlighted fields.</p>;
  return null;
}

function ToggleRow({ name, label, hint, defaultChecked }: { name: string; label: string; hint: string; defaultChecked: boolean }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <div className="flex items-start justify-between gap-6 border-b border-stone py-4 last:border-0">
      <div>
        <p className="text-sm font-medium text-espresso" id={`${name}-label`}>
          {label}
        </p>
        <p className="mt-0.5 text-xs text-charcoal/60">{hint}</p>
      </div>
      <Switch name={name} checked={on} onCheckedChange={setOn} aria-labelledby={`${name}-label`} />
    </div>
  );
}

export type SettingsValues = {
  title: string;
  votingEnabled: boolean;
  heroIntro: string;
  maxVotesPerDevicePerRestaurant: number;
  maxVotesPerNetworkPerHour: number;
  requireBotCheck: boolean;
};

export function SettingsForm({ values, editable, botConfigured }: { values: SettingsValues; editable: boolean; botConfigured: boolean }) {
  const [state, action, pending] = useActionState(saveSettings, {});
  const e = state.errors ?? {};
  return (
    <form action={action}>
      <fieldset disabled={!editable} className="grid gap-8 xl:grid-cols-2">
        <section className="space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/55">Voting</h3>
          <div className="rounded-[3px] border border-stone px-4">
            <ToggleRow name="votingEnabled" label="Voting enabled" hint="Voting is open while this is on. Turn it off to pause." defaultChecked={values.votingEnabled} />
            <ToggleRow
              name="requireBotCheck"
              label="Bot protection (Turnstile)"
              hint={botConfigured ? "Cloudflare Turnstile keys are configured." : "Keys are missing — production voting will refuse submissions until they are set."}
              defaultChecked={values.requireBotCheck}
            />
          </div>

          <h3 className="pt-2 text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/55">Voting rules</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Votes per device, per restaurant"
              htmlFor="maxVotesPerDevicePerRestaurant"
              error={e.maxVotesPerDevicePerRestaurant}
              hint="Based on an anonymous cookie. 0 disables."
            >
              <Input id="maxVotesPerDevicePerRestaurant" name="maxVotesPerDevicePerRestaurant" type="number" min={0} max={50} defaultValue={values.maxVotesPerDevicePerRestaurant} />
            </Field>
            <Field
              label="Votes per network, per hour"
              htmlFor="maxVotesPerNetworkPerHour"
              error={e.maxVotesPerNetworkPerHour}
              hint="Keep generous — diners share restaurant Wi-Fi. 0 disables."
            >
              <Input id="maxVotesPerNetworkPerHour" name="maxVotesPerNetworkPerHour" type="number" min={0} max={10000} defaultValue={values.maxVotesPerNetworkPerHour} />
            </Field>
          </div>
          <p className="text-xs leading-relaxed text-charcoal/55">
            These safeguards deter casual repeat voting. They cannot guarantee one vote per person: cookies can be
            cleared and networks are shared.
          </p>
        </section>

        <section className="space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/55">Campaign content</h3>
          <Field label="Campaign title" htmlFor="title" error={e.title}>
            <Input id="title" name="title" defaultValue={values.title} required />
          </Field>
          <Field label="Homepage introduction" htmlFor="heroIntro" error={e.heroIntro} hint="Supporting text under TASTE. CLICK. VOTE.">
            <Textarea id="heroIntro" name="heroIntro" defaultValue={values.heroIntro} rows={3} maxLength={400} />
          </Field>
        </section>
      </fieldset>
      <div className="mt-8 flex items-center gap-4 border-t border-stone pt-6">
        <Button type="submit" variant="primary" disabled={pending || !editable}>
          {pending && <Loader2 className="animate-spin" />}
          Save settings
        </Button>
        {!editable && <p className="text-sm text-charcoal/55">Only owners can change campaign settings.</p>}
        <Saved state={state} />
      </div>
    </form>
  );
}

export function NewAdminForm() {
  const [state, action, pending] = useActionState(createAdminUser, {});
  const e = state.errors ?? {};
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1fr_1.3fr_0.8fr_1fr_auto] xl:items-start">
      <Field label="Name" htmlFor="new-name" error={e.name}>
        <Input id="new-name" name="name" required />
      </Field>
      <Field label="Email" htmlFor="new-email" error={e.email}>
        <Input id="new-email" name="email" type="email" required autoComplete="off" />
      </Field>
      <Field label="Role" htmlFor="new-role" error={e.role}>
        <Select id="new-role" name="role" defaultValue="EDITOR">
          <option value="VIEWER">Viewer</option>
          <option value="EDITOR">Editor</option>
          <option value="OWNER">Owner</option>
        </Select>
      </Field>
      <Field label="Temporary password" htmlFor="new-password" error={e.password} hint="12+ characters">
        <Input id="new-password" name="password" type="password" required autoComplete="new-password" />
      </Field>
      <div className="xl:pt-6">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          Add
        </Button>
      </div>
      <div className="sm:col-span-2 xl:col-span-5">
        <Saved state={state} />
      </div>
    </form>
  );
}

export function RemoveAdminButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  if (msg) return <span className="text-xs text-red-deep">{msg}</span>;
  return confirm ? (
    <span className="flex gap-1">
      <Button size="sm" variant="destructive" disabled={pending} onClick={() => start(async () => setMsg((await removeAdminUser(id)).message ?? null))}>
        Remove {name}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setConfirm(false)}>
        Cancel
      </Button>
    </span>
  ) : (
    <Button size="sm" variant="ghost" onClick={() => setConfirm(true)}>
      Remove
    </Button>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, {});
  const e = state.errors ?? {};
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-start">
      <Field label="Current password" htmlFor="current" error={e.current}>
        <Input id="current" name="current" type="password" required autoComplete="current-password" />
      </Field>
      <Field label="New password" htmlFor="next" error={e.next} hint="12+ characters. You'll be signed out everywhere.">
        <Input id="next" name="next" type="password" required autoComplete="new-password" />
      </Field>
      <div className="sm:pt-6">
        <Button type="submit" variant="outline" disabled={pending}>
          Change password
        </Button>
      </div>
    </form>
  );
}
