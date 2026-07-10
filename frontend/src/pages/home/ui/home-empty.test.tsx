import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomePage } from "@/pages/home";

describe("HomePage — état vide", () => {
  it("affiche un message quand il n'y a aucun article", () => {
    render(<HomePage locale="fr" articles={[]} />);
    expect(screen.getByText(/Aucun article pour l'instant/)).toBeInTheDocument();
  });
});
