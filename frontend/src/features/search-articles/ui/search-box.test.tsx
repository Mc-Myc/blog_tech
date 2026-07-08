import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchBox } from "@/features/search-articles";

describe("SearchBox", () => {
  it("rend un champ avec le placeholder et la valeur initiale", () => {
    render(<SearchBox locale="fr" initialQuery="docker" />);
    const input = screen.getByRole("searchbox");
    expect(input).toHaveValue("docker");
    expect(input).toHaveAttribute("placeholder");
  });
  it("cible l'action de recherche de la locale", () => {
    const { container } = render(<SearchBox locale="fr" />);
    expect(container.querySelector("form")).toHaveAttribute("action", "/fr/search");
  });
});
