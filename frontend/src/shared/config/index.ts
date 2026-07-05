export const SITE_NAME = "blog_tech — expériences Claude Code";
export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";

export function isLocale(x: string): x is Locale {
  return (LOCALES as readonly string[]).includes(x);
}
