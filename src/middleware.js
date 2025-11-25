import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const response = NextResponse.next();
  const origin = request.headers.get("origin");


  const path = request.nextUrl.pathname;
  // Origines autorisées
  const allowedOrigins = [
    "https://www.bibliojouets.fr",
    "https://bibliojouets.fr",
    "https://bibliojouets.com",
    "https://www.bibliojouets.com",
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


// --- 2. Sécurité NextAuth ---
// On récupère le token (secret doit être dans .env)
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const isAdminRoute = path.startsWith("/admin");
  const isUserRoute = path.startsWith("/mon-compte") || path.startsWith("/panier");

  // Cas A : Non connecté essayant d'accéder à une page privée
  if ((isAdminRoute || isUserRoute) && !token) {
    // Redirection vers login (ou accueil pour l'instant)
    const url = new URL("/api/auth/signin", request.url);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  // Cas B : Connecté mais pas Admin essayant d'accéder à /admin
  if (isAdminRoute && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }


  return response;
}
//route à surveiller
export const config = {
  matcher: [
    // API routes
    "/api/:path*",
    // Pages protégées
    "/admin/:path*",
    "/mon-compte/:path*",
    "/panier/:path*"
  ],
};