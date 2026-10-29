import type { Metadata } from "next";
import { getCampaignSettings, getPublicResults } from "@/lib/campaign";
import { Cta } from "@/components/site/cta";
import { Reveal } from "@/components/site/reveal";
import { SmartImage } from "@/components/site/smart-image";
import { TextPage } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Results",
  description: "The results of Taste, Click & Vote — the best Tiramisù in Mogadishu, chosen by you.",
  alternates: { canonical: "/results" },
};

export default async function ResultsPage() {
  const settings = await getCampaignSettings();

  if (!settings.resultsPublic) {
    return (
      <TextPage
        index="05"
        eyebrow="Results"
        title={
          <>
            The verdict is <span className="italic text-red">still being tasted.</span>
          </>
        }
        intro={<p>Results will be announced by the Embassy of Italy in Mogadishu. Until then, every vote counts.</p>}
      >
        <Cta href="/vote" variant="espresso">
          Cast your vote
        </Cta>
      </TextPage>
    );
  }

  const results = await getPublicResults();
  return (
    <TextPage
      index="05"
      eyebrow="Results"
      title={
        <>
          Your <span className="italic text-green-deep">verdict.</span>
        </>
      }
      intro={<p>Ranked by average overall experience, as rated by visitors (scale 1–5).</p>}
    >
      {results.length === 0 ? (
        <p className="font-display text-2xl italic text-espresso/70">No votes have been recorded.</p>
      ) : (
        <ol className="border-t border-espresso/15">
          {results.map((r, i) => (
            <Reveal as="li" key={r.restaurant.id} delay={i * 0.06} className="flex items-center gap-5 border-b border-espresso/15 py-6">
              <span className="w-12 font-display text-4xl italic text-gold">{String(i + 1).padStart(2, "0")}</span>
              <span className="relative size-16 shrink-0 overflow-hidden bg-stone">
                {r.restaurant.imageUrl && <SmartImage src={r.restaurant.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-2xl text-espresso">{r.restaurant.name}</span>
                <span className="text-sm text-charcoal/60">
                  {r.votes} vote{r.votes === 1 ? "" : "s"} · presentation {r.presentation.toFixed(1)} · taste {r.taste.toFixed(1)}
                </span>
              </span>
              <span className="text-right">
                <span className="block font-display text-3xl tabular-nums text-espresso">{r.overall.toFixed(2)}</span>
                <span className="eyebrow text-espresso/50">Overall</span>
              </span>
            </Reveal>
          ))}
        </ol>
      )}
    </TextPage>
  );
}
