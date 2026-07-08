import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticlePage } from "@/pages/article";

const article = {
  slug: "singleton", locale: "fr" as const, kind: "standard" as const,
  title: "Le singleton", excerpt: "E", readingTime: 9,
  publishedAt: "2026-06-28T00:00:00Z", tags: ["python"],
  bodyMdx: "# Section\n\ntexte", scene: null, series: null,
};

describe("ArticlePage", () => {
  it("rend l'article et le lien retour vers la home locale", () => {
    render(<ArticlePage article={article} locale="fr" />);
    expect(screen.getByRole("heading", { level: 1, name: "Le singleton" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /tous les articles/ })).toHaveAttribute("href", "/fr");
  });
});
