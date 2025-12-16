import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const response = NextResponse.next();
  const origin = request.headers.get("origin");
  const path = request.nextUrl.pathname;

  // --- 0. LAISSER PASSER LES FICHIERS STATIQUES (Sécurité ceinture et bretelles) ---
  // Si le matcher rate, ceci sauvera l'affichage des images
  if (
    path.startsWith("/uploads") || 
    path.startsWith("/_next") || 
    path.startsWith("/favicon.ico") ||
    path.startsWith("/api/upload") // On laisse l'upload accessible pour le moment (géré par le controller)
  ) {
    return NextResponse.next();
  }

  // --- 1. GESTION CORS ---
  const allowedOrigins = [
    "https://www.bibliojouets.fr",
    "https://bibliojouets.fr",
    "https://bibliojouets.com",
    "https://www.bibliojouets.com",
  ];

  // Autoriser localhost en développement
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

  // --- 2. SÉCURITÉ NEXTAUTH ---
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const isAdminRoute = path.startsWith("/admin");
  const isUserRoute = path.startsWith("/mon-compte") || path.startsWith("/panier");

  // Cas A : Non connecté essayant d'accéder à une page privée
  if ((isAdminRoute || isUserRoute) && !token) {
    const url = new URL("/connexion", request.url); // J'ai remis /connexion car c'est ta page de login
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  // Cas B : Connecté mais pas Admin essayant d'accéder à /admin
  if (isAdminRoute && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

// Configuration du matcher (Routes surveillées)
export const config = {
  matcher: [
    // La regex négative (?!) exclut tout ce qui commence par ces chemins
    '/((?!_next/static|_next/image|favicon.ico|uploads|api/upload).*)',
  ],
};