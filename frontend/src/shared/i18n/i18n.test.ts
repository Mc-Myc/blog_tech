import { describe, it, expect } from "vitest";
import { t } from "@/shared/i18n";

describe("shared/i18n", () => {
  it("retourne le dictionnaire français", () => {
    expect(t("fr").nav.articles).toBe("Articles");
    expect(t("fr").search.empty).toContain("Aucun");
  });
  it("retourne le dictionnaire anglais", () => {
    expect(t("en").nav.articles).toBe("Articles");
    expect(t("en").reading).toContain("min");
  });
});
