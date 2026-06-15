import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PREFIXES = [
  "/maintenance",
  "/login",
  "/register",
  "/verify-email",
  "/api/auth",
  "/api/maintenance",
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/public",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicRoute = PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
  if (isPublicRoute) {
    return NextResponse.next();
  }

  const authRole = req.cookies.get("authRole")?.value;
  const isAdmin = authRole === "SUPER_ADMIN";

  if (isAdmin) {
    return NextResponse.next();
  }

  // Maintenance mode check is now handled in app/layout.tsx to avoid Edge runtime limitations
  // We simply pass the pathname to the layout so it knows where we are.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Admin route protection for non-admins
  const isAdminPageRoute = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApiRoute = pathname.startsWith("/api/admin/");

  if (isAdminPageRoute) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = `?redirect=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminApiRoute) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};