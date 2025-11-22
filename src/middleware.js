import { NextResponse } from "next/server";

export function middleware(request) {
  const response = NextResponse.next();
  const origin = request.headers.get("origin");

  // Origines autorisées
  const allowedOrigins = [
    "https://www.bibliojouets.fr",
    "https://bibliojouets.fr",
    "https://bibliojouets.com",
  ];

  // Autoriser localhost en développement uniquement
  if (process.env.NODE_ENV === "development") {
    allowedOrigins.push("http://localhost:3000");
    allowedOrigins.push("http://127.0.0.1:3000");
  }

  // Définir CORS si l'origine est autorisée
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Max-Age", "86400");

  // Gérer les requêtes preflight OPTIONS
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  return response;
}

export const config = {
  matcher: "/api/:path*",
};