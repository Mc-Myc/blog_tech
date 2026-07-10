import { notFound } from "next/navigation";
import { isLocale } from "@/shared/config";
import { searchArticles, type ArticleListItem } from "@/entities/article";
import { SearchPage } from "@/pages/search";

export default async function Page(
  { params, searchParams }: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ q?: string }>;
  },
) {
  const { locale } = await params;
  const { q } = await searchParams;
  if (!isLocale(locale)) notFound();
  const query = q ?? "";
  let results: ArticleListItem[] = [];
  if (query.trim()) results = await searchArticles(query, locale);
  return <SearchPage locale={locale} query={query} results={results} />;
}
