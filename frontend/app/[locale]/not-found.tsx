import Link from "next/link";
import { DICTS } from "@/shared/i18n/dictionaries";

// Server Components at the [locale] level (not-found/error/loading) don't reliably
// receive the `locale` route param, so this stays French-only (DICTS.fr) for now.
// Per-locale rendering here would need client-side locale detection — out of scope.
const tr = DICTS.fr;

export default function NotFound() {
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
