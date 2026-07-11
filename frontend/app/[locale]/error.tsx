"use client";

import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, isLocale } from "@/shared/config";
import { t } from "@/shared/i18n";

// Client Component (can't read the `x-locale` header via next/headers), so the locale is
// derived from the first path segment instead — set by middleware.ts (/fr/..., /en/...).
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const pathname = usePathname();
  const segment = pathname?.split("/")[1] ?? "";
  const tr = t(isLocale(segment) ? segment : DEFAULT_LOCALE);
  return (
    <div className="wrap" style={{ padding: "80px 24px", textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--ink-strong)" }}>
        {tr.errorTitle}
      </h1>
      <p style={{ color: "var(--muted)", margin: "12px 0 24px" }}>
        {tr.errorBody}
      </p>
      <button onClick={reset} style={{ minHeight: "var(--tap)", padding: "10px 18px",
        border: "1px solid var(--accent)", color: "var(--accent)", background: "var(--accent-soft)",
        borderRadius: 8, cursor: "pointer", fontFamily: "var(--font-mono)" }}>
        {tr.errorRetry}
      </button>
    </div>
  );
}
