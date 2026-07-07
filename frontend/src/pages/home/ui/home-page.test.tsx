import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomePage } from "@/pages/home";

const articles = [
  { slug: "a", locale: "fr" as const, kind: "standard" as const, title: "Article A",
    excerpt: "E", readingTime: 5, publishedAt: "2026-06-21T00:00:00Z", tags: [] },
  { slug: "b", locale: "fr" as const, kind: "code_3d" as const, title: "Article B",
    excerpt: "E", readingTime: 9, publishedAt: "2026-06-28T00:00:00Z", tags: [] },
];

describe("HomePage", () => {
  it("liste les cartes d'articles", () => {
    render(<HomePage locale="fr" articles={articles} />);
    expect(screen.getByText("Article A")).toBeInTheDocument();
    expect(screen.getByText("Article B")).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });
});
