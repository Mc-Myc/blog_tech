import { apiBase } from "./config";

export async function proxyText(path: string, contentType: string): Promise<Response> {
  const upstream = await fetch(`${apiBase()}${path}`, { cache: "no-store" });
  if (!upstream.ok) return new Response("upstream indisponible", { status: 502 });
  const body = await upstream.text();
  return new Response(body, { status: 200, headers: { "content-type": contentType } });
}
