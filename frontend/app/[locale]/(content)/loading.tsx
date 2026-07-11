import { t } from "@/shared/i18n";
import { localeFromHeaders } from "@/shared/i18n/server-locale";

// Server Components at the [locale] level (not-found/error/loading) don't reliably
// receive the `locale` route param, so the locale is read from the `x-locale` header
// forwarded by middleware.ts (see shared/i18n/server-locale.ts).
export default async function Loading() {
  const tr = t(await localeFromHeaders());
  return (
    <div className="wrap" style={{ padding: "80px 24px", color: "var(--muted)",
      fontFamily: "var(--font-mono)", fontSize: 14 }}>
      {tr.loadingLabel}
    </div>
  );
}
