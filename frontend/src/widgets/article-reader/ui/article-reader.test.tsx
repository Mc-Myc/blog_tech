import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArticleReader } from "@/widgets/article-reader";

const article = {
  slug: "singleton", locale: "fr" as const, kind: "code_3d" as const,
  title: "Le singleton", excerpt: "E", readingTime: 9,
  publishedAt: "2026-06-28T00:00:00Z", tags: ["python"],
  bodyMdx: "# La demande\n\nJe voulais un `Config` global.", scene: { version: 2 }, series: null,
};

describe("ArticleReader", () => {
  it("rend le titre et le markdown converti en HTML", () => {
    render(<ArticleReader article={article} locale="fr" />);
    expect(screen.getByRole("heading", { level: 1, name: "Le singleton" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "La demande" })).toBeInTheDocument();
    expect(screen.getByText("Config")).toBeInTheDocument(); // <code>
  });
  it("affiche l'encart scène 3D pour un article code_3d", () => {
    render(<ArticleReader article={article} locale="fr" />);
    expect(screen.getByText(/Scène 3D à venir/)).toBeInTheDocument();
  });
});
