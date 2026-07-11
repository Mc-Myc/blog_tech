import { headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/shared/config";

/**
 * Reads the locale forwarded by `middleware.ts` (`x-locale` request header) for use in
 * Server Components that don't reliably receive the `[locale]` route param — namely the
 * root layout and the route boundaries (`not-found.tsx`, `loading.tsx`) at the `[locale]`
 * segment. Falls back to `DEFAULT_LOCALE` when the header is absent (e.g. matched paths
 * excluded from the middleware, or direct calls outside of a request context).
 *
 * NOTE: calling this makes the Server Component that uses it dynamic (SSR) rather than
 * static/ISR, since `headers()` opts the render out of the static cache. Accepted tradeoff.
 */
export async function localeFromHeaders(): Promise<Locale> {
  const h = await headers();
  const hl = h.get("x-locale");
  return hl && isLocale(hl) ? hl : DEFAULT_LOCALE;
}
