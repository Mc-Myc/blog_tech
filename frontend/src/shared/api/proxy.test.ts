import { describe, it, expect, vi, afterEach } from "vitest";
import { proxyText } from "@/shared/api/proxy";

afterEach(() => vi.restoreAllMocks());

describe("proxyText", () => {
  it("relaie le corps et pose le content-type", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("# hello", { status: 200 })));
    const res = await proxyText("/llms.txt", "text/markdown; charset=utf-8");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/markdown");
    expect(await res.text()).toBe("# hello");
  });
  it("renvoie 502 si l'upstream échoue", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 500 })));
    const res = await proxyText("/llms.txt", "text/markdown");
    expect(res.status).toBe(502);
  });
});
