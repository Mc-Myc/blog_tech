import { describe, it, expect } from "vitest";
import { SITE_NAME, LOCALES, DEFAULT_LOCALE, isLocale } from "@/shared/config";

describe("shared/config", () => {
  it("expose les locales et le défaut", () => {
    expect(LOCALES).toEqual(["fr", "en"]);
    expect(DEFAULT_LOCALE).toBe("fr");
    expect(SITE_NAME).toContain("blog_tech");
  });
  it("isLocale valide fr/en et rejette le reste", () => {
    expect(isLocale("fr")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale("")).toBe(false);
  });
});
