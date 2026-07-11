import { DICTS } from "@/shared/i18n/dictionaries";

// Server Components at the [locale] level (not-found/error/loading) don't reliably
// receive the `locale` route param, so this stays French-only (DICTS.fr) for now.
// Per-locale rendering here would need client-side locale detection — out of scope.
const tr = DICTS.fr;

export default function Loading() {
  return (
    <div className="wrap" style={{ padding: "80px 24px", color: "var(--muted)",
      fontFamily: "var(--font-mono)", fontSize: 14 }}>
      {tr.loadingLabel}
    </div>
  );
}
