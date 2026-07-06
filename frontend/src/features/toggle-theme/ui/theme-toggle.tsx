"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [light, setLight] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("bt-theme") === "light";
    setLight(saved);
    document.documentElement.dataset.theme = saved ? "light" : "";
  }, []);
  function toggle() {
    const next = !light;
    setLight(next);
    document.documentElement.dataset.theme = next ? "light" : "";
    localStorage.setItem("bt-theme", next ? "light" : "");
  }
  return (
    <button onClick={toggle} title="clair / sombre" aria-label="basculer le thème"
      style={{ cursor: "pointer", border: "1px solid var(--line)", borderRadius: 99,
        width: 34, height: 34, background: "none", color: "var(--ink)" }}>
      ◐
    </button>
  );
}
