import type { Metadata } from "next";
import { Clause, TextPage } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How the Taste, Click & Vote website handles data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <TextPage
      index="—"
      eyebrow="Privacy"
      title={
        <>
          Privacy <span className="italic text-green-deep">Policy</span>
        </>
      }
      intro={
        <p>
          This notice describes how the Taste, Click &amp; Vote website processes data. The organiser&rsquo;s formal
          privacy statement is pending approval from the Embassy of Italy in Mogadishu and will be published here.
        </p>
      }
    >
      <Clause title="What we collect when you vote">
        <ul>
          <li>The restaurant you selected, the type of Tiramisù, your three ratings, and the time of submission.</li>
          <li>
            We do <strong>not</strong> ask for your name, email address, phone number or any account.
          </li>
        </ul>
      </Clause>
      <Clause title="Fair-voting safeguards">
        <p>
          To discourage repeat or automated voting we store two one-way, keyed fingerprints alongside each vote: one
          derived from an anonymous random cookie on your device, and one derived from your network address. Your IP
          address itself is never stored, and the fingerprints cannot be reversed to reveal it.
        </p>
        <p>
          We use Cloudflare Turnstile to check that votes come from people rather than bots. Turnstile is provided by
          Cloudflare, Inc. and processes technical signals from your browser for that purpose only.
        </p>
      </Clause>
      <Clause title="Cookies">
        <ul>
          <li>
            <strong>scim_device</strong> — an anonymous random identifier set when you vote, used only for the
            safeguards above. It expires after 60 days.
          </li>
          <li>
            <strong>scim_admin</strong> — a session cookie used only by campaign administrators who sign in.
          </li>
        </ul>
        <p>No advertising or third-party tracking cookies are used.</p>
      </Clause>
      <Clause title="How results are used">
        <p>
          Votes are counted in aggregate to recognise participating restaurants during the Week of Italian Cuisine in
          the World 2026. Only authorised campaign administrators can access individual vote records.
        </p>
      </Clause>
    </TextPage>
  );
}
