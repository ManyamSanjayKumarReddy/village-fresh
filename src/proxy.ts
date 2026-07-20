import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/v1/admin");

  if (!isLoggedIn) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "Sign in required." } },
        { status: 401 },
      );
    }

    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && req.auth?.user?.role !== "admin") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Admin access required." } },
        { status: 403 },
      );
    }
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }
});

export const config = {
  matcher: [
    "/account/:path*",
    "/checkout/:path*",
    "/admin/:path*",
    "/api/v1/account/:path*",
    "/api/v1/orders/:path*",
    "/api/v1/cart/:path*",
    "/api/v1/admin/:path*",
  ],
};
