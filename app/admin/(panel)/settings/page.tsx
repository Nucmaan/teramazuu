import { Suspense } from "react";
import { db } from "@/lib/db";
import { isOwner, requireAdmin } from "@/lib/auth";
import { getCampaignSettings } from "@/lib/campaign";
import { botCheckConfigured } from "@/lib/security";
import { toCampaignLocalInput } from "@/lib/time";
import { PageBody, PageHeader, PanelSkeleton } from "@/components/admin/page-header";
import { NewAdminForm, PasswordForm, RemoveAdminButton, SettingsForm } from "@/components/admin/settings-forms";
import { Badge, Card, CardHeader } from "@/components/ui/card";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Voting window, rules, campaign content and administrators." />
      <Suspense fallback={<PanelSkeleton />}>
        <Settings />
      </Suspense>
    </>
  );
}

async function Settings() {
  const admin = await requireAdmin();
  const owner = isOwner(admin);
  const [s, admins] = await Promise.all([
    getCampaignSettings(),
    owner
      ? db.adminUser.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, role: true } })
      : Promise.resolve([]),
  ]);

  return (
    <PageBody>
      <Card>
        <CardHeader title="Campaign" description="Times are entered and shown in Africa/Mogadishu (UTC+3)." />
        <div className="p-6">
          <SettingsForm
            editable={owner}
            botConfigured={botCheckConfigured()}
            values={{
              title: s.title,
              startLocal: toCampaignLocalInput(s.startDate),
              endLocal: toCampaignLocalInput(s.endDate),
              votingEnabled: s.votingEnabled,
              resultsPublic: s.resultsPublic,
              heroIntro: s.heroIntro,
              offerNote: s.offerNote,
              maxVotesPerDevicePerRestaurant: s.maxVotesPerDevicePerRestaurant,
              maxVotesPerNetworkPerHour: s.maxVotesPerNetworkPerHour,
              requireBotCheck: s.requireBotCheck,
            }}
          />
        </div>
      </Card>

      {owner && (
        <Card>
          <CardHeader title="Administrators" description="Owners manage everything · Editors manage restaurants · Viewers see analytics." />
          <ul className="divide-y divide-stone">
            {admins.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-espresso">
                    {a.name} {a.id === admin.id && <span className="text-charcoal/45">(you)</span>}
                  </p>
                  <p className="text-xs text-charcoal/55">{a.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={a.role === "OWNER" ? "gold" : a.role === "EDITOR" ? "green" : "neutral"}>{a.role.toLowerCase()}</Badge>
                  {a.id !== admin.id && <RemoveAdminButton id={a.id} name={a.name} />}
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-stone p-6">
            <NewAdminForm />
          </div>
        </Card>
      )}

      <Card>
        <CardHeader title="Your password" />
        <div className="p-6">
          <PasswordForm />
        </div>
      </Card>
    </PageBody>
  );
}
