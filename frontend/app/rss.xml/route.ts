import { proxyText } from "@/shared/api";

export const dynamic = "force-dynamic";

export function GET() {
  return proxyText("/rss.xml", "application/rss+xml; charset=utf-8");
}
