import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export { default } from "next-auth/middleware";

const protectedRoutes = ["/dashboard"];

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXT_AUTH_SECRET! });

  const currentUrl = req.nextUrl;

  if (!token && protectedRoutes.includes(currentUrl.pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (
    token &&
    (currentUrl.pathname === "/login" ||
      currentUrl.pathname === "/signup" ||
      currentUrl.pathname === "/verify")
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/verify"],
};
