import type { Locale } from "@/shared/config";

export type ArticleKind = "standard" | "code_3d" | "til";

export interface ArticleListItem {
  slug: string;
  locale: Locale;
  kind: ArticleKind;
  title: string;
  excerpt: string;
  readingTime: number;
  publishedAt: string | null;
  tags: string[];
}

export interface ArticleDetail extends ArticleListItem {
  bodyMdx: string;
  scene: Record<string, unknown> | null;
  series: string | null;
}
