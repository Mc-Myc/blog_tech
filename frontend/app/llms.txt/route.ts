import { proxyText } from "@/shared/api";

export const dynamic = "force-dynamic";

export function GET() {
  return proxyText("/llms.txt", "text/markdown; charset=utf-8");
}
