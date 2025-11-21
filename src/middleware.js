import { NextResponse } from "next/server";

export function middleware(request) {
  const response = NextResponse.next();
  const origin = request.headers.get("origin");

  const allowedOrigins = [
    "https://www.bibliojouets.fr",
    "https://bibliojouets.fr",
    "https://bibliojouets.com"
  ];

  // Autorise uniquement tes domaines
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

  return response;
}

// Appliquer uniquement aux routes API
export const config = {
  matcher: "/api/:path*",
};

export default middleware;