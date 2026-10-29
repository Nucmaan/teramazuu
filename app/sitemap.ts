import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: siteUrl("/vote"), changeFrequency: "daily", priority: 0.9 },
    { url: siteUrl("/results"), changeFrequency: "daily", priority: 0.6 },
    { url: siteUrl("/terms"), changeFrequency: "monthly", priority: 0.3 },
    { url: siteUrl("/privacy"), changeFrequency: "monthly", priority: 0.3 },
  ];
}
