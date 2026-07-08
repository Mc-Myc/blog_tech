import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchPage } from "@/pages/search";

const results = [
  { slug: "a", locale: "fr" as const, kind: "standard" as const, title: "Docker menteur",
    excerpt: "E", readingTime: 7, publishedAt: "2026-06-21T00:00:00Z", tags: ["docker"] },
];

describe("SearchPage", () => {
  it("affiche les résultats", () => {
    render(<SearchPage locale="fr" query="docker" results={results} />);
    expect(screen.getByText("Docker menteur")).toBeInTheDocument();
  });
  it("affiche l'état vide quand aucun résultat pour une requête", () => {
    render(<SearchPage locale="fr" query="zzz" results={[]} />);
    expect(screen.getByText(/Aucun résultat/)).toBeInTheDocument();
  });
});
