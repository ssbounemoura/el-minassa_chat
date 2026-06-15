import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));

  // Supprimer les cookies - UN SEUL paramètre
  response.cookies.delete("authRole");
  response.cookies.delete("authUserId");

  return response;
}

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));

  response.cookies.delete("authRole");
  response.cookies.delete("authUserId");

  return response;
}