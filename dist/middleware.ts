import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authCookieName = "authRole";
const allowedRoutes = [
  "/maintenance",
  "/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/maintenance/check",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authRole = req.cookies.get(authCookieName)?.value;
  const isAdmin = authRole === "SUPER_ADMIN";

  const isAllowedRoute = allowedRoutes.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isAllowedRoute) {
    return NextResponse.next();
  }

  const settingsResponse = await fetch(new URL("/api/maintenance/check", req.url), {
    headers: { accept: "application/json" },
  });

  if (!settingsResponse.ok) {
    return NextResponse.next();
  }

  const { maintenanceMode } = await settingsResponse.json();
  if (!maintenanceMode) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (isAdmin) {
      return NextResponse.next();
    }

    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  if (isAdmin) {
    return NextResponse.next();
  }

  const maintenanceUrl = req.nextUrl.clone();
  maintenanceUrl.pathname = "/maintenance";
  maintenanceUrl.search = "";
  return NextResponse.redirect(maintenanceUrl);
}
