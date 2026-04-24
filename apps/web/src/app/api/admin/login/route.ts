import { NextResponse, type NextRequest } from "next/server";

import { signSession, SESSION_COOKIE_NAME } from "~/lib/admin-session";

export async function POST(req: NextRequest) {
  const { password } = (await req.json()) as { password?: string };

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const token = await signSession(
    process.env.ADMIN_SESSION_SECRET ?? "",
    "admin",
  );
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
