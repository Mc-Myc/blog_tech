import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleCard } from "@/entities/article";

const base = {
  slug: "singleton", locale: "fr" as const, kind: "code_3d" as const,
  title: "Le singleton", excerpt: "Il avait raison.", readingTime: 9,
  publishedAt: "2026-06-28T00:00:00Z", tags: ["python", "design-patterns"],
};

describe("ArticleCard", () => {
  it("affiche titre, excerpt, temps de lecture et lien locale", () => {
    render(<ArticleCard article={base} locale="fr" />);
    expect(screen.getByText("Le singleton")).toBeInTheDocument();
    expect(screen.getByText(/Il avait raison/)).toBeInTheDocument();
    expect(screen.getByText(/9 min/)).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/fr/articles/singleton");
  });
  it("marque le badge code_3d", () => {
    render(<ArticleCard article={base} locale="fr" />);
    expect(screen.getByText("code_3d")).toBeInTheDocument();
  });
});
