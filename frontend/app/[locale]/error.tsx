"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="wrap" style={{ padding: "80px 24px", textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--ink-strong)" }}>
        Quelque chose a cassé
      </h1>
      <p style={{ color: "var(--muted)", margin: "12px 0 24px" }}>
        Le contenu n'a pas pu être chargé. Le serveur est peut-être momentanément indisponible.
      </p>
      <button onClick={reset} style={{ minHeight: "var(--tap)", padding: "10px 18px",
        border: "1px solid var(--accent)", color: "var(--accent)", background: "var(--accent-soft)",
        borderRadius: 8, cursor: "pointer", fontFamily: "var(--font-mono)" }}>
        ↻ Réessayer
      </button>
    </div>
  );
}
