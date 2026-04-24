import { NextResponse, type NextRequest } from "next/server";

import { verifySession, SESSION_COOKIE_NAME } from "~/lib/admin-session";

export const config = {
  matcher: ["/admin/:path*"],
};

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  if (pathname === "/admin/login") return NextResponse.next();

  const secret = process.env.ADMIN_SESSION_SECRET;
  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!secret || !(await verifySession(secret, cookie))) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
