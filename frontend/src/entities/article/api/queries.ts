import { apiGet, paginated } from "@/shared/api";
import type { Locale } from "@/shared/config";
import { articleListItemSchema, articleDetailSchema } from "./schema";
import type { ArticleDetail, ArticleListItem } from "../model/types";
import { z } from "zod";

type Raw = z.infer<typeof articleListItemSchema>;
type RawDetail = z.infer<typeof articleDetailSchema>;

function toItem(r: Raw): ArticleListItem {
  return {
    slug: r.slug, locale: r.locale as Locale, kind: r.kind, title: r.title,
    excerpt: r.excerpt, readingTime: r.reading_time,
    publishedAt: r.published_at, tags: r.tags,
  };
}

function toDetail(r: RawDetail): ArticleDetail {
  return { ...toItem(r), bodyMdx: r.body_mdx, scene: r.scene, series: r.series };
}

export async function fetchArticles(
  params: { locale: Locale; kind?: string; tag?: string },
): Promise<ArticleListItem[]> {
  const q = new URLSearchParams({ locale: params.locale });
  if (params.kind) q.set("kind", params.kind);
  if (params.tag) q.set("tag", params.tag);
  const data = await apiGet(`/articles/?${q}`, paginated(articleListItemSchema));
  return data.results.map(toItem);
}

export async function fetchArticle(slug: string, locale: Locale): Promise<ArticleDetail> {
  const data = await apiGet(`/articles/${slug}/?locale=${locale}`, articleDetailSchema);
  return toDetail(data);
}

export async function searchArticles(q: string, locale: Locale): Promise<ArticleListItem[]> {
  const params = new URLSearchParams({ q, locale });
  const data = await apiGet(`/search/?${params}`, paginated(articleListItemSchema));
  return data.results.map(toItem);
}
