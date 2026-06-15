import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));

  // Supprimer les cookies - méthode correcte (sans options)
  response.cookies.delete("authRole");
  response.cookies.delete("authUserId");

  return response;
}

// Support aussi GET si nécessaire
export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/login", request.url));

  response.cookies.delete("authRole");
  response.cookies.delete("authUserId");

  return response;
}