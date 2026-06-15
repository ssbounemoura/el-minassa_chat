import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));

  response.cookies.delete("authRole", { path: "/" });
  response.cookies.delete("authUserId", { path: "/" });

  return response;
}
