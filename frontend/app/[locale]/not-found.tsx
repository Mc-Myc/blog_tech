import Link from "next/link";
import { t } from "@/shared/i18n";
import { localeFromHeaders } from "@/shared/i18n/server-locale";

// Server Components at the [locale] level (not-found/error/loading) don't reliably
// receive the `locale` route param, so the locale is read from the `x-locale` header
// forwarded by middleware.ts (see shared/i18n/server-locale.ts).
export default async function NotFound() {
  const tr = t(await localeFromHeaders());
  return (
    <div className="wrap" style={{ padding: "80px 24px", textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--ink-strong)" }}>
        {tr.notFoundTitle}
      </h1>
      <p style={{ color: "var(--muted)", margin: "12px 0 24px" }}>
        {tr.notFoundBody}
      </p>
      <Link href="/" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
        {tr.notFoundLink}
      </Link>
    </div>
  );
}
