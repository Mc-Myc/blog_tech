import type { Locale } from "@/shared/config";
import { DICTS, type Dict } from "./dictionaries";

export function t(locale: Locale): Dict {
  return DICTS[locale];
}
export type { Dict } from "./dictionaries";
// NOTE: `localeFromHeaders` (server-locale.ts) is intentionally NOT re-exported here.
// This barrel is imported by Client Components (e.g. search-box.tsx); re-exporting a
// module that pulls in `next/headers` breaks the client bundle even if unused ("You're
// importing a component that needs next/headers"). Import it directly from
// "@/shared/i18n/server-locale" in Server Components instead.
