"use client";

import { DICTS } from "@/shared/i18n/dictionaries";

// Server/Client Components at the [locale] level (not-found/error/loading) don't reliably
// receive the `locale` route param, so this stays French-only (DICTS.fr) for now.
// Per-locale rendering here would need client-side locale detection — out of scope.
const tr = DICTS.fr;

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
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
