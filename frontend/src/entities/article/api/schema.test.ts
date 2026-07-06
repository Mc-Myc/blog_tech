import { describe, it, expect } from "vitest";
import { articleListItemSchema, articleDetailSchema } from "@/entities/article/api/schema";

describe("article schemas", () => {
  it("parse un item de liste", () => {
    const r = articleListItemSchema.parse({
      slug: "s", locale: "fr", kind: "code_3d", title: "T", excerpt: "E",
      reading_time: 3, published_at: "2026-07-03T00:00:00Z", tags: ["python"],
    });
    expect(r.reading_time).toBe(3);
  });
  it("parse un détail avec scene et body", () => {
    const r = articleDetailSchema.parse({
      slug: "s", locale: "fr", kind: "code_3d", title: "T", excerpt: "E",
      reading_time: 3, published_at: null, tags: [],
      body_mdx: "# H", scene: { version: 2 }, series: null,
    });
    expect(r.body_mdx).toBe("# H");
    expect(r.scene).toEqual({ version: 2 });
  });
});
