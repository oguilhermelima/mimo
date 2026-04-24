import {
  getCookieCache,
  getSessionCookie,
} from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

const COOKIE_PREFIX = "caixa";

export const config = {
  matcher: ["/admin/:path*", "/conta/:path*"],
};

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");

  const sessionCookie = getSessionCookie(req, { cookiePrefix: COOKIE_PREFIX });
  if (!sessionCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/entrar";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdminRoute) {
    const cache = await getCookieCache(req, {
      cookiePrefix: COOKIE_PREFIX,
      secret: process.env.BETTER_AUTH_SECRET,
    });

    if (cache && (cache.user as { role?: string }).role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
