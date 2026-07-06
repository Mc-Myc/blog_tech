import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteShell } from "@/widgets/site-shell";

describe("SiteShell", () => {
  it("rend le logo, la nav et les enfants", () => {
    render(<SiteShell locale="fr"><p>contenu</p></SiteShell>);
    expect(screen.getByText(/blog/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Articles" })).toHaveAttribute("href", "/fr");
    expect(screen.getByRole("link", { name: "Recherche" })).toHaveAttribute("href", "/fr/search");
    expect(screen.getByText("contenu")).toBeInTheDocument();
  });
  it("propose le lien vers l'autre locale", () => {
    render(<SiteShell locale="fr"><span /></SiteShell>);
    expect(screen.getByRole("link", { name: /EN/i })).toHaveAttribute("href", "/en");
  });
});
