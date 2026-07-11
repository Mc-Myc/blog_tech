import { NextRequest, NextResponse } from "next/server";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "@/shared/config";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const current = LOCALES.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (current) {
    const headers = new Headers(req.headers);
    headers.set("x-locale", current satisfies Locale);
    return NextResponse.next({ request: { headers } });
  }
  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|llms.txt|rss.xml|sitemap.xml|robots.txt|favicon.ico).*)"],
};
