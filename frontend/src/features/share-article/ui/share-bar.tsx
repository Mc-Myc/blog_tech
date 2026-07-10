"use client";
import type { CSSProperties } from "react";

const btn: CSSProperties = {
  width: "var(--tap)", height: "var(--tap)", borderRadius: 99,
  border: "1px solid var(--line)", background: "none", color: "var(--muted)",
  cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 14,
};

export function ShareBar({ title }: { title: string }) {
  function share(net: "x" | "linkedin" | "copy") {
    const url = window.location.href;
    if (net === "copy") { void navigator.clipboard?.writeText(url); return; }
    const enc = encodeURIComponent(url);
    const href = net === "x"
      ? `https://twitter.com/intent/tweet?url=${enc}&text=${encodeURIComponent(title)}`
      : `https://www.linkedin.com/sharing/share-offsite/?url=${enc}`;
    window.open(href, "_blank", "noopener");
  }
  return (
    <div role="group" aria-label="partager" style={{ display: "flex", gap: 10, margin: "24px 0" }}>
      <button onClick={() => share("x")} aria-label="partager sur X" style={btn}>𝕏</button>
      <button onClick={() => share("linkedin")} aria-label="partager sur LinkedIn" style={btn}>in</button>
      <button onClick={() => share("copy")} aria-label="copier le lien" style={btn}>⧉</button>
    </div>
  );
}
