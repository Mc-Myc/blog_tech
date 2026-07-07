import { notFound } from "next/navigation";
import { isLocale, LOCALES } from "@/shared/config";
import { SiteShell } from "@/widgets/site-shell";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout(
  { children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <SiteShell locale={locale}>{children}</SiteShell>;
}
