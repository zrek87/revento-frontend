import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/dashboard", "/admin"];
const authRoutes = ["/auth/signin", "/auth/signup"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const userRole = request.cookies.get("user_role")?.value;
  const url = request.nextUrl.clone();

  const isProtected = protectedRoutes.some((route) =>
    url.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    url.pathname.startsWith(route)
  );
  const isAdminRoute = url.pathname.startsWith("/admin");

  //Redirect unauthenticated users from protected routes
  if (isProtected && !token) {
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  //Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  //Restrict access to admin for non-admin users
  if (isAdminRoute && userRole !== "admin") {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/auth/:path*"],
  runtime: "nodejs",
};
