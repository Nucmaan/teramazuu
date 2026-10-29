import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const description =
  "Taste, Click & Vote — celebrate the Week of Italian Cuisine in the World 2026 in Mogadishu. Discover exceptional Tiramisù at participating restaurants and vote for your favourite. 30 October – 10 November 2026.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Taste, Click & Vote — Week of Italian Cuisine in the World 2026 · Mogadishu",
    template: "%s · Taste, Click & Vote — #SCIM2026",
  },
  description,
  keywords: ["Week of Italian Cuisine in the World", "SCIM2026", "Tiramisù", "Mogadishu", "Embassy of Italy", "cucina italiana"],
  openGraph: {
    type: "website",
    siteName: "Taste, Click & Vote — #SCIM2026",
    title: "Taste. Click. Vote. — The Best Tiramisù in Mogadishu",
    description,
    locale: "en_GB",
    images: [{ url: "/images/photo/cta-dark.jpg", width: 2400, height: 1600, alt: "A slice of Tiramisù with cocoa and chocolate shavings" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ItalyInSomalia",
    title: "Taste. Click. Vote. — #SCIM2026",
    description,
    images: ["/images/photo/cta-dark.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f8f5ef",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} antialiased`}>
      <body className="min-h-svh">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
