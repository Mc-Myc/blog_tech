import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, LOCALES } from "@/shared/config";
import { ApiError } from "@/shared/api";
import { fetchArticle, fetchArticles } from "@/entities/article";
import { ArticlePage } from "@/pages/article";

export const revalidate = 60;

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of LOCALES) {
    try {
      const articles = await fetchArticles({ locale });
      for (const a of articles) params.push({ locale, slug: a.slug });
    } catch {
      // API indisponible au build : pas de pré-génération, ISR à la demande
    }
  }
  return params;
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; slug: string }> },
): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  try {
    const a = await fetchArticle(slug, locale);
    return { title: a.title, description: a.excerpt,
      openGraph: { title: a.title, description: a.excerpt, type: "article" } };
  } catch {
    return {};
  }
}

export default async function Page(
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  try {
    const article = await fetchArticle(slug, locale);
    return <ArticlePage article={article} locale={locale} />;
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}
