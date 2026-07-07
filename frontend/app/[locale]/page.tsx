import { isLocale } from "@/shared/config";
import { notFound } from "next/navigation";
import { fetchArticles } from "@/entities/article";
import { HomePage } from "@/pages/home";

export const revalidate = 60;

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const articles = await fetchArticles({ locale });
  return <HomePage locale={locale} articles={articles} />;
}
