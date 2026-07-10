import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: "80px 24px", textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--ink-strong)" }}>
        404 — page introuvable
      </h1>
      <p style={{ color: "var(--muted)", margin: "12px 0 24px" }}>
        Cet article n'existe pas ou n'est pas encore publié.
      </p>
      <Link href="/" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
        ← retour à l'accueil
      </Link>
    </div>
  );
}
