import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: siteUrl("/vote"), changeFrequency: "daily", priority: 0.9 },
  ];
}
