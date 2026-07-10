import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShareBar } from "@/features/share-article";

describe("ShareBar", () => {
  it("rend trois actions de partage avec labels accessibles", () => {
    render(<ShareBar title="Le singleton" />);
    expect(screen.getByRole("button", { name: /partager sur X/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /LinkedIn/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copier le lien/i })).toBeInTheDocument();
  });
});
