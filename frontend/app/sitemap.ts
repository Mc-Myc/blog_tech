import type { MetadataRoute } from "next";
import { LOCALES } from "@/shared/config";
import { fetchArticles } from "@/entities/article";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of LOCALES) {
    entries.push({ url: `${base}/${locale}`, changeFrequency: "daily", priority: 1 });
    try {
      const articles = await fetchArticles({ locale });
      for (const a of articles) {
        entries.push({
          url: `${base}/${locale}/articles/${a.slug}`,
          lastModified: a.publishedAt ?? undefined,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    } catch {
      // API indisponible au build : sitemap réduit aux accueils
    }
  }
  return entries;
}
