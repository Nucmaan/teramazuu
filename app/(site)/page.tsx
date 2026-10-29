import { Hero } from "@/components/site/hero";
import { Story } from "@/components/home/story";
import { History } from "@/components/home/history";
import { HowItWorks } from "@/components/home/how-it-works";
import { Restaurants } from "@/components/home/restaurants";
import { VoteCta } from "@/components/home/vote-cta";
import { getActiveRestaurants, getCampaignSettings } from "@/lib/campaign";
import { siteUrl } from "@/lib/utils";

export default async function HomePage() {
  const [settings, restaurants] = await Promise.all([getCampaignSettings(), getActiveRestaurants()]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Taste, Click & Vote — Week of Italian Cuisine in the World 2026",
    description:
      "Celebrate Italian cuisine in Mogadishu: enjoy Tiramisù at participating restaurants and vote for your favourite.",
    startDate: settings.startDate.toISOString(),
    endDate: settings.endDate.toISOString(),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: "Participating restaurants in Mogadishu",
      address: { "@type": "PostalAddress", addressLocality: "Mogadishu", addressCountry: "SO" },
    },
    organizer: { "@type": "Organization", name: "Embassy of Italy in Mogadishu" },
    image: [siteUrl("/images/photo/cta-dark.jpg")],
    url: siteUrl("/"),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }}
      />
      <Hero intro={settings.heroIntro} />
      <Story />
      <History />
      <HowItWorks />
      <Restaurants restaurants={restaurants} />
      <VoteCta />
    </>
  );
}
