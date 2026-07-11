import { describe, it, expect, vi, afterEach } from "vitest";
import { z } from "zod";
import { apiGet, ApiError, paginated } from "@/shared/api";

const Item = z.object({ slug: z.string() });

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("shared/api", () => {
  it("parse une réponse paginée valide", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({ count: 1, next: null, previous: null, results: [{ slug: "a" }] }),
        { status: 200 })));
    const data = await apiGet("/articles/", paginated(Item));
    expect(data.count).toBe(1);
    expect(data.results[0].slug).toBe("a");
  });

  it("lève ApiError sur 404", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 404 })));
    await expect(apiGet("/articles/x/", Item)).rejects.toBeInstanceOf(ApiError);
  });

  it("lève ApiError si le JSON ne matche pas le schéma", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({ wrong: true }), { status: 200 })));
    await expect(apiGet("/x/", Item)).rejects.toBeInstanceOf(ApiError);
  });

  it("lève ApiError si le corps 2xx n'est pas du JSON", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<html>oops</html>", { status: 200 })));
    await expect(apiGet("/x/", Item)).rejects.toBeInstanceOf(ApiError);
  });
});
