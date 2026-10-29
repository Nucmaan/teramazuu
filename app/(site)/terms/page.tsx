import type { Metadata } from "next";
import { Clause, TextPage } from "@/components/site/legal-page";
import { getCampaignSettings } from "@/lib/campaign";
import { formatCampaignDateTime } from "@/lib/time";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms for the Taste, Click & Vote campaign — Week of Italian Cuisine in the World 2026, Mogadishu.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const s = await getCampaignSettings();
  return (
    <TextPage
      index="—"
      eyebrow="Terms"
      title={
        <>
          Terms &amp; <span className="italic text-red">Conditions</span>
        </>
      }
      intro={
        <p>
          The complete campaign terms are being finalised by the Embassy of Italy in Mogadishu. The points below
          reflect the official campaign materials.
        </p>
      }
    >
      {s.offerNote && (
        <Clause title="The offer">
          <p>{s.offerNote}</p>
        </Clause>
      )}
      <Clause title="Voting period">
        <p>
          Voting is open from {formatCampaignDateTime(s.startDate)} to {formatCampaignDateTime(s.endDate)}, Mogadishu
          time (EAT, UTC+3). Votes submitted outside this period are not accepted.
        </p>
      </Clause>
      <Clause title="How to vote">
        <ul>
          <li>Enjoy Tiramisù at a participating restaurant.</li>
          <li>Scan the QR code provided at the restaurant, or open this website.</li>
          <li>Select your restaurant and Tiramisù, rate presentation, taste and overall experience, and submit.</li>
        </ul>
      </Clause>
      <Clause title="Fair play">
        <p>
          Automated, bulk or repeated voting is not permitted. The organisers may exclude votes that appear to be
          fraudulent or that breach these terms.
        </p>
      </Clause>
    </TextPage>
  );
}
